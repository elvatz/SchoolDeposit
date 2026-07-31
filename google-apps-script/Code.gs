/**
 * Kas & Tabungan Siswa — Google Apps Script Backend
 *
 * Deploy this script bound to the Google Spreadsheet described in
 * docs/SETUP.md, then deploy it as a Web App (Execute as: Me,
 * Who has access: Anyone). Copy the resulting /exec URL into the
 * Next.js app's NEXT_PUBLIC_GAS_API_URL environment variable.
 *
 * Sheets expected:
 *   - "Students": id | nis | name | class | createdAt
 *   - "Ledger":   id | date | studentId | studentName | account |
 *                 transactionType | period | amount | description | createdAt
 *
 * "period" is a "yyyy-MM" string marking which month's dues a Deposit
 * covers (e.g. a single deposit can be split across several months of
 * Tabungan/Kas iuran). It is left blank for Withdrawal/Belanja.
 */

var STUDENTS_SHEET = "Students";
var LEDGER_SHEET = "Ledger";

/** Belanja (class purchase/expense) is a shared Kas expense — not tied to any single student. */
var CLASS_KAS_LABEL = "Kas Kelas";

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

function doGet(e) {
  try {
    var resource = e.parameter.resource;
    var data;

    if (resource === "students") {
      data = getStudents(e.parameter.search, e.parameter.id);
    } else if (resource === "ledger") {
      if (e.parameter.mode === "student") {
        data = getStudentLedger(e.parameter.studentId);
      } else {
        data = getLedgerList(e.parameter);
      }
    } else if (resource === "reports") {
      data = getReports(e.parameter);
    } else {
      return jsonResponse(false, null, "Resource tidak dikenal: " + resource);
    }

    return jsonResponse(true, data, null);
  } catch (err) {
    return jsonResponse(false, null, err.message);
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var resource = body.resource;
    var action = body.action;
    var data;

    if (resource === "students") {
      data = handleStudentMutation(action, body);
    } else if (resource === "ledger") {
      data = handleLedgerMutation(action, body);
    } else {
      return jsonResponse(false, null, "Resource tidak dikenal: " + resource);
    }

    return jsonResponse(true, data, null);
  } catch (err) {
    return jsonResponse(false, null, err.message);
  }
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

function getStudents(search, id) {
  var rows = sheetToObjects(getSheet(STUDENTS_SHEET));

  if (id) {
    var found = rows.filter(function (r) { return r.id === id; })[0];
    if (!found) throw new Error("Siswa tidak ditemukan");
    return found;
  }

  if (search) {
    var q = search.toLowerCase();
    rows = rows.filter(function (r) {
      return (
        String(r.name).toLowerCase().indexOf(q) !== -1 ||
        String(r.nis).toLowerCase().indexOf(q) !== -1 ||
        String(r.class).toLowerCase().indexOf(q) !== -1
      );
    });
  }

  rows.sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
  return rows;
}

function handleStudentMutation(action, body) {
  var sheet = getSheet(STUDENTS_SHEET);

  if (action === "create") {
    validateRequired(body, ["nis", "name", "class"]);
    var id = generateId("STU");
    var createdAt = new Date().toISOString();
    sheet.appendRow([id, body.nis, body.name, body.class, createdAt]);
    return { id: id, nis: body.nis, name: body.name, class: body.class, createdAt: createdAt };
  }

  if (action === "update") {
    validateRequired(body, ["id", "nis", "name", "class"]);
    var rowIndex = findRowIndexById(sheet, body.id);
    if (rowIndex === -1) throw new Error("Siswa tidak ditemukan");
    sheet.getRange(rowIndex, 2, 1, 3).setValues([[body.nis, body.name, body.class]]);

    // Keep denormalized studentName on the Ledger sheet in sync.
    syncStudentNameOnLedger(body.id, body.name);

    return { id: body.id, nis: body.nis, name: body.name, class: body.class };
  }

  if (action === "delete") {
    validateRequired(body, ["id"]);
    var idx = findRowIndexById(sheet, body.id);
    if (idx === -1) throw new Error("Siswa tidak ditemukan");
    sheet.deleteRow(idx);
    return { id: body.id };
  }

  throw new Error("Aksi tidak dikenal: " + action);
}

function syncStudentNameOnLedger(studentId, newName) {
  var sheet = getSheet(LEDGER_SHEET);
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][2] === studentId) {
      sheet.getRange(i + 1, 4).setValue(newName); // studentName column
    }
  }
}

// ---------------------------------------------------------------------------
// Ledger
// ---------------------------------------------------------------------------

function getLedgerList(params) {
  var all = getLedgerWithRunningBalance();

  var filtered = all.filter(function (entry) {
    if (params.studentId && entry.studentId !== params.studentId) return false;
    if (params.account && params.account !== "all" && entry.account !== params.account) return false;
    if (params.startDate && entry.date < params.startDate) return false;
    if (params.endDate && entry.date > params.endDate) return false;
    if (params.search) {
      var q = params.search.toLowerCase();
      if (
        String(entry.description).toLowerCase().indexOf(q) === -1 &&
        String(entry.studentName).toLowerCase().indexOf(q) === -1
      ) {
        return false;
      }
    }
    return true;
  });

  var sortBy = params.sortBy || "date";
  var sortDir = params.sortDir || "desc";
  filtered.sort(function (a, b) {
    var av = sortBy === "amount" ? a.amount : a.date;
    var bv = sortBy === "amount" ? b.amount : b.date;
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  var page = Number(params.page) || 1;
  var pageSize = Number(params.pageSize) || 10;
  var start = (page - 1) * pageSize;
  var pageItems = filtered.slice(start, start + pageSize);

  return { data: pageItems, total: filtered.length, page: page, pageSize: pageSize };
}

/**
 * Reads every ledger row, sorts chronologically (by date, then creation
 * order), and computes a single global running balance across all
 * students and accounts combined. Deposits add, withdrawals subtract.
 */
function getLedgerWithRunningBalance() {
  var rows = sheetToObjects(getLedgerSheetRaw());

  rows.sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return String(a.createdAt).localeCompare(String(b.createdAt));
  });

  var running = 0;
  var withBalance = rows.map(function (r) {
    var debit = r.transactionType === "Deposit" ? Number(r.amount) : 0;
    var credit = (r.transactionType === "Withdrawal" || r.transactionType === "Belanja") ? Number(r.amount) : 0;
    running += debit - credit;
    return {
      id: r.id,
      date: r.date,
      studentId: r.studentId,
      studentName: r.studentName,
      account: r.account,
      transactionType: r.transactionType,
      period: r.period || "",
      amount: Number(r.amount),
      description: r.description,
      createdAt: r.createdAt,
      debit: debit,
      credit: credit,
      runningBalance: running,
    };
  });

  return withBalance;
}

function getLedgerSheetRaw() {
  return getSheet(LEDGER_SHEET);
}

function getStudentLedger(studentId) {
  if (!studentId) throw new Error("studentId wajib diisi");

  var student = getStudents(null, studentId);
  var all = getLedgerWithRunningBalance().filter(function (e) {
    return e.studentId === studentId;
  });

  // Running balance scoped to this student only (both accounts combined),
  // recomputed in chronological order.
  var running = 0;
  var saldoTabungan = 0;
  var saldoKas = 0;
  var entries = all.map(function (e) {
    running += e.debit - e.credit;
    if (e.account === "Tabungan") saldoTabungan += e.debit - e.credit;
    if (e.account === "Kas") saldoKas += e.debit - e.credit;
    return {
      id: e.id,
      date: e.date,
      studentId: e.studentId,
      studentName: e.studentName,
      account: e.account,
      transactionType: e.transactionType,
      period: e.period,
      amount: e.amount,
      description: e.description,
      createdAt: e.createdAt,
      debit: e.debit,
      credit: e.credit,
      runningBalance: running,
    };
  });

  // Show most recent first for readability; totals above are unaffected.
  entries.reverse();

  return { student: student, saldoTabungan: saldoTabungan, saldoKas: saldoKas, entries: entries };
}

function handleLedgerMutation(action, body) {
  var sheet = getSheet(LEDGER_SHEET);

  if (action === "create") {
    validateRequired(body, ["date", "account", "transactionType", "amount", "description"]);
    validateLedgerBusinessRules(body);

    var studentId = "";
    var studentName = CLASS_KAS_LABEL;
    if (body.transactionType !== "Belanja") {
      validateRequired(body, ["studentId"]);
      var student = getStudents(null, body.studentId);
      studentId = body.studentId;
      studentName = student.name;
    }

    var createdAt = new Date().toISOString();
    var totalAmount = Number(body.amount);

    // Deposit can be split across one or more months of dues ("period").
    // Withdrawal/Belanja are single rows with no period.
    if (body.transactionType === "Deposit") {
      var periods = body.periods && body.periods.length ? body.periods : [null];
      var n = periods.length;
      var base = Math.floor(totalAmount / n);
      var entries = [];

      for (var i = 0; i < n; i++) {
        var amt = i === n - 1 ? totalAmount - base * (n - 1) : base;
        var periodStr = periods[i] ? formatPeriod(periods[i].year, periods[i].month) : "";
        var id = generateId("LED");

        sheet.appendRow([
          id,
          body.date,
          studentId,
          studentName,
          body.account,
          body.transactionType,
          periodStr,
          amt,
          body.description,
          createdAt,
        ]);

        entries.push({
          id: id,
          date: body.date,
          studentId: studentId,
          studentName: studentName,
          account: body.account,
          transactionType: body.transactionType,
          period: periodStr,
          amount: amt,
          description: body.description,
          createdAt: createdAt,
        });
      }

      return n > 1 ? { entries: entries, count: n } : entries[0];
    }

    var id2 = generateId("LED");
    sheet.appendRow([
      id2,
      body.date,
      studentId,
      studentName,
      body.account,
      body.transactionType,
      "",
      totalAmount,
      body.description,
      createdAt,
    ]);

    return {
      id: id2,
      date: body.date,
      studentId: studentId,
      studentName: studentName,
      account: body.account,
      transactionType: body.transactionType,
      period: "",
      amount: totalAmount,
      description: body.description,
      createdAt: createdAt,
    };
  }

  if (action === "update") {
    validateRequired(body, ["id", "date", "account", "transactionType", "amount", "description"]);
    validateLedgerBusinessRules(body, body.id);

    var rowIndex = findRowIndexById(sheet, body.id);
    if (rowIndex === -1) throw new Error("Transaksi tidak ditemukan");

    var updatedStudentId = "";
    var updatedStudentName = CLASS_KAS_LABEL;
    if (body.transactionType !== "Belanja") {
      validateRequired(body, ["studentId"]);
      var student2 = getStudents(null, body.studentId);
      updatedStudentId = body.studentId;
      updatedStudentName = student2.name;
    }

    var updatedPeriod = "";
    if (body.transactionType === "Deposit" && body.periods && body.periods.length === 1) {
      updatedPeriod = formatPeriod(body.periods[0].year, body.periods[0].month);
    } else if (body.transactionType === "Deposit" && body.period) {
      updatedPeriod = body.period;
    }

    sheet.getRange(rowIndex, 2, 1, 8).setValues([
      [
        body.date,
        updatedStudentId,
        updatedStudentName,
        body.account,
        body.transactionType,
        updatedPeriod,
        Number(body.amount),
        body.description,
      ],
    ]);

    return { id: body.id };
  }

  if (action === "delete") {
    validateRequired(body, ["id"]);
    var idx = findRowIndexById(sheet, body.id);
    if (idx === -1) throw new Error("Transaksi tidak ditemukan");
    sheet.deleteRow(idx);
    return { id: body.id };
  }

  throw new Error("Aksi tidak dikenal: " + action);
}

/**
 * Business rules:
 *  - amount must be > 0, date is required
 *  - Withdrawal only ever applies to a student's own Tabungan (personal
 *    savings) and cannot exceed that student's Tabungan balance
 *  - Belanja only ever applies to Kas, is not tied to any single student,
 *    and cannot exceed the shared Kas balance across the whole class
 */
function validateLedgerBusinessRules(body, excludeId) {
  var amount = Number(body.amount);
  if (!amount || amount <= 0) throw new Error("Nominal harus lebih dari 0");
  if (!body.date) throw new Error("Tanggal tidak boleh kosong");
  if (body.account !== "Tabungan" && body.account !== "Kas") {
    throw new Error("Account tidak valid");
  }
  if (body.transactionType !== "Deposit" && body.transactionType !== "Withdrawal" && body.transactionType !== "Belanja") {
    throw new Error("Jenis transaksi tidak valid");
  }
  if (body.transactionType === "Withdrawal" && body.account !== "Tabungan") {
    throw new Error("Withdrawal hanya berlaku untuk account Tabungan");
  }
  if (body.transactionType === "Belanja" && body.account !== "Kas") {
    throw new Error("Belanja hanya berlaku untuk account Kas");
  }
  if (body.transactionType === "Deposit" && (!body.periods || !body.periods.length)) {
    throw new Error("Pilih minimal satu periode bulan untuk Deposit");
  }

  if (body.transactionType === "Withdrawal") {
    var studentEntries = getLedgerWithRunningBalance().filter(function (e) {
      return e.studentId === body.studentId && e.account === "Tabungan" && e.id !== excludeId;
    });
    var studentBalance = studentEntries.reduce(function (sum, e) { return sum + e.debit - e.credit; }, 0);
    if (amount > studentBalance) {
      throw new Error(
        "Withdrawal tidak boleh lebih besar dari saldo Tabungan siswa. Saldo saat ini: " + studentBalance
      );
    }
  }

  if (body.transactionType === "Belanja") {
    var kasEntries = getLedgerWithRunningBalance().filter(function (e) {
      return e.account === "Kas" && e.id !== excludeId;
    });
    var kasBalance = kasEntries.reduce(function (sum, e) { return sum + e.debit - e.credit; }, 0);
    if (amount > kasBalance) {
      throw new Error(
        "Belanja tidak boleh lebih besar dari saldo Kas kelas. Saldo Kas saat ini: " + kasBalance
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

function getReports(params) {
  if (params.mode === "dashboard") return getDashboardSummary();
  if (params.mode === "student") return getStudentSummary(params.studentId);
  if (params.mode === "monthlyMatrix") return getMonthlyMatrix(params);
  return getPeriodSummary(params.month, params.year);
}

function getDashboardSummary() {
  var students = sheetToObjects(getSheet(STUDENTS_SHEET));
  var ledger = getLedgerWithRunningBalance();

  var totalTabungan = 0;
  var totalKas = 0;
  var totalWithdrawal = 0;
  var totalBelanja = 0;

  ledger.forEach(function (e) {
    if (e.transactionType === "Withdrawal") {
      totalWithdrawal += e.amount;
    } else if (e.transactionType === "Belanja") {
      totalBelanja += e.amount;
    } else if (e.account === "Tabungan") {
      totalTabungan += e.amount;
    } else if (e.account === "Kas") {
      totalKas += e.amount;
    }
  });

  var totalSaldo = ledger.reduce(function (sum, e) { return sum + e.debit - e.credit; }, 0);

  var recent = ledger.slice().sort(function (a, b) {
    return String(b.createdAt).localeCompare(String(a.createdAt));
  }).slice(0, 8);

  return {
    totalStudents: students.length,
    totalTabungan: totalTabungan,
    totalKas: totalKas,
    totalWithdrawal: totalWithdrawal,
    totalBelanja: totalBelanja,
    totalSaldo: totalSaldo,
    recentTransactions: recent,
  };
}

function getPeriodSummary(month, year) {
  var ledger = getLedgerWithRunningBalance();

  if (month && year) {
    var mm = String(month).length === 1 ? "0" + month : String(month);
    var prefix = year + "-" + mm;
    ledger = ledger.filter(function (e) { return String(e.date).indexOf(prefix) === 0; });
  }

  var totalTabungan = 0;
  var totalKas = 0;
  var totalWithdrawal = 0;
  var totalBelanja = 0;

  ledger.forEach(function (e) {
    if (e.transactionType === "Withdrawal") {
      totalWithdrawal += e.amount;
    } else if (e.transactionType === "Belanja") {
      totalBelanja += e.amount;
    } else if (e.account === "Tabungan") {
      totalTabungan += e.amount;
    } else if (e.account === "Kas") {
      totalKas += e.amount;
    }
  });

  var saldo = ledger.reduce(function (sum, e) { return sum + e.debit - e.credit; }, 0);

  return {
    totalTabungan: totalTabungan,
    totalKas: totalKas,
    totalWithdrawal: totalWithdrawal,
    totalBelanja: totalBelanja,
    saldo: saldo,
  };
}

function getStudentSummary(studentId) {
  if (!studentId) throw new Error("studentId wajib diisi");
  var ledger = getLedgerWithRunningBalance().filter(function (e) { return e.studentId === studentId; });

  var totalTabungan = 0;
  var totalKas = 0;
  var totalWithdrawal = 0;
  var totalBelanja = 0;

  ledger.forEach(function (e) {
    if (e.transactionType === "Withdrawal") {
      totalWithdrawal += e.amount;
    } else if (e.transactionType === "Belanja") {
      totalBelanja += e.amount;
    } else if (e.account === "Tabungan") {
      totalTabungan += e.amount;
    } else if (e.account === "Kas") {
      totalKas += e.amount;
    }
  });

  var saldo = ledger.reduce(function (sum, e) { return sum + e.debit - e.credit; }, 0);

  return {
    totalTabungan: totalTabungan,
    totalKas: totalKas,
    totalWithdrawal: totalWithdrawal,
    totalBelanja: totalBelanja,
    saldo: saldo,
  };
}

/**
 * Builds a students × months matrix of Deposit totals for a single
 * account (Tabungan or Kas), based on each entry's `period`. Used for
 * the "Laporan Iuran Bulanan" view (who has paid dues for which month).
 */
function getMonthlyMatrix(params) {
  var account = params.account === "Tabungan" ? "Tabungan" : "Kas";
  var months = buildPeriodRange(params.startMonth, params.startYear, params.endMonth, params.endYear);

  var students = sheetToObjects(getSheet(STUDENTS_SHEET));
  students.sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });

  var deposits = getLedgerWithRunningBalance().filter(function (e) {
    return e.account === account && e.transactionType === "Deposit" && e.period;
  });

  var matrix = students.map(function (s) {
    var amounts = {};
    months.forEach(function (m) { amounts[m] = 0; });
    var total = 0;
    deposits.forEach(function (e) {
      if (e.studentId === s.id && Object.prototype.hasOwnProperty.call(amounts, e.period)) {
        amounts[e.period] += e.amount;
        total += e.amount;
      }
    });
    return { studentId: s.id, name: s.name, class: s.class, amounts: amounts, total: total };
  });

  var totalsByMonth = {};
  months.forEach(function (m) { totalsByMonth[m] = 0; });
  matrix.forEach(function (row) {
    months.forEach(function (m) { totalsByMonth[m] += row.amounts[m]; });
  });

  var grandTotal = matrix.reduce(function (sum, row) { return sum + row.total; }, 0);

  return {
    account: account,
    months: months,
    students: matrix,
    totalsByMonth: totalsByMonth,
    grandTotal: grandTotal,
  };
}

function buildPeriodRange(startMonth, startYear, endMonth, endYear) {
  var months = [];
  var m = Number(startMonth);
  var y = Number(startYear);
  var endM = Number(endMonth);
  var endY = Number(endYear);
  var guard = 0;
  while ((y < endY || (y === endY && m <= endM)) && guard < 120) {
    months.push(formatPeriod(y, m));
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    guard += 1;
  }
  return months;
}

function formatPeriod(year, month) {
  var mm = String(month).length === 1 ? "0" + month : String(month);
  return year + "-" + mm;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(name) {
  var sheet = getSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error("Sheet tidak ditemukan: " + name);
  return sheet;
}

function sheetToObjects(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row[0]) continue; // skip blank rows
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = row[j];
      if (key === "date" && val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      } else if ((key === "createdAt") && val instanceof Date) {
        val = val.toISOString();
      } else if (key === "period" && val instanceof Date) {
        // Sheets sometimes auto-coerces a "yyyy-MM" string into a real
        // Date if the column format isn't locked to Plain Text. Convert
        // it back to the "yyyy-MM" key our reports compare against.
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM");
      }
      obj[key] = val;
    }
    rows.push(obj);
  }
  return rows;
}

function findRowIndexById(sheet, id) {
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === id) return i + 1; // 1-indexed sheet row
  }
  return -1;
}

function generateId(prefix) {
  return prefix + "-" + Utilities.getUuid().split("-")[0].toUpperCase();
}

function validateRequired(body, fields) {
  fields.forEach(function (f) {
    if (body[f] === undefined || body[f] === null || body[f] === "") {
      throw new Error("Field wajib diisi: " + f);
    }
  });
}

function jsonResponse(success, data, error) {
  var payload = { success: success };
  if (data !== null && data !== undefined) payload.data = data;
  if (error) payload.error = error;
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/**
 * Run this once if your "Iuran Bulanan" report shows everything as empty
 * even though the Ledger sheet has data in the `period` column. This
 * happens when Sheets auto-converted "2026-07" strings into real Date
 * values (looks fine visually, but breaks the exact string match the
 * report relies on). This function locks the `period` column to Plain
 * Text and rewrites any existing Date values back into "yyyy-MM" strings.
 */
function fixPeriodColumnFormat() {
  var sheet = getSheet(LEDGER_SHEET);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var periodCol = headers.indexOf("period") + 1;
  if (!periodCol) throw new Error('Kolom "period" tidak ditemukan. Jalankan migrateAddPeriodColumn dulu.');

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var range = sheet.getRange(2, periodCol, lastRow - 1, 1);

  // Lock the column to Plain Text so future writes are never re-coerced
  // into Date values by Sheets' auto-detection.
  sheet.getRange(1, periodCol, sheet.getMaxRows() - 1, 1).setNumberFormat("@");

  var values = range.getValues();
  var fixed = values.map(function (row) {
    var val = row[0];
    if (val instanceof Date) {
      return [Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM")];
    }
    return [val];
  });
  range.setValues(fixed);
}

/**
 * Run this once if your Ledger sheet was created before the "period"
 * column existed (i.e. you deployed this app before the monthly-dues
 * feature was added). Inserts a "period" column after transactionType
 * without touching any existing data. Safe to run multiple times.
 */
function migrateAddPeriodColumn() {
  var sheet = getSheet(LEDGER_SHEET);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (headers.indexOf("period") !== -1) return; // already migrated

  var transactionTypeCol = headers.indexOf("transactionType") + 1;
  sheet.insertColumnAfter(transactionTypeCol);
  sheet.getRange(1, transactionTypeCol + 1).setValue("period");
  // Lock to Plain Text immediately so newly-entered periods never get
  // auto-coerced into Date values.
  sheet.getRange(1, transactionTypeCol + 1, sheet.getMaxRows()).setNumberFormat("@");
}

/**
 * Run this once manually from the Apps Script editor to create the
 * Students and Ledger sheets with the correct headers if they don't
 * already exist. See docs/SETUP.md.
 */
function setupSheets() {
  var ss = getSpreadsheet();

  if (!ss.getSheetByName(STUDENTS_SHEET)) {
    var students = ss.insertSheet(STUDENTS_SHEET);
    students.appendRow(["id", "nis", "name", "class", "createdAt"]);
  }

  if (!ss.getSheetByName(LEDGER_SHEET)) {
    var ledger = ss.insertSheet(LEDGER_SHEET);
    ledger.appendRow([
      "id",
      "date",
      "studentId",
      "studentName",
      "account",
      "transactionType",
      "period",
      "amount",
      "description",
      "createdAt",
    ]);
    // Lock "period" to Plain Text so "2026-07" strings never get
    // auto-coerced into Date values by Sheets' auto-detection.
    ledger.getRange(1, 7, ledger.getMaxRows()).setNumberFormat("@");
  }
}
