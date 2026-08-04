 
# School Cash & Deposit

A web application for managing student savings, class cash funds, and expenses, with all transactions recorded in a single **General Ledger** so that all reports originate from a single source of truth.

Built with **Next.js 15 (App Router)**, **TypeScript**, **TailwindCSS**, **shadcn/ui-style components**, **TanStack Query**, **React Hook Form + Zod**, and **Google Spreadsheets** (via Google Apps Script) as the database—freeing the project from traditional databases like MySQL/PostgreSQL.

---

## 🚀 Features

- **Dashboard** — Total students, total savings, total cash, total withdrawals, total expenses, total balance, summary charts, and recent transactions (auto-refresh).
- **Students** — Student data CRUD (NIS/Student ID, name, class) with search functionality.
- **Transactions** — Select the **Transaction Type** first (Deposit / Withdrawal / Expense), and the remaining fields adapt automatically:
  - **Deposit** — Can go to Savings or Cash, requires selecting a student. Each deposit is linked to one or more **contribution periods** (month + year). If depositing for multiple months simultaneously (e.g., Rp500,000 for 5 months), simply click "+ Add Month" and the amount splits evenly per month, recorded as separate rows in the General Ledger.
  - **Withdrawal** — Account automatically locks to **Savings** (student's personal balance), requires selecting a student, and cannot exceed that student's Savings balance.
  - **Expense** — Account automatically locks to **Cash** (class cash expenses, e.g., cleaning supplies), is **not** linked to any student since Cash is shared funds, and cannot exceed the total combined Cash balance across all students.
- **General Ledger** — Complete transaction history featuring Debit/Credit/Running Balance columns (calculated in real-time rather than stored), search, filters by date/student/account, sorting, pagination, and CSV export.
- **Per-Student Ledger** — Individual Savings & Cash balances per student along with their specific transaction history.
- **Reports** — Total summaries, monthly reports (filtered by month/year), per-student reports, and **Monthly Dues** (a student × month matrix similar to traditional manual class cash logs, separated for Savings and Cash, with a flexible month range selector) — each exportable to PDF, CSV, Excel, or printable.
- **Settings** — Google Apps Script connection status checker.
- **UX Polish** — Dark mode, skeleton loading, empty states, toast notifications, and confirmation dialogs before deletion.

---

## 📁 Folder Structure

```text
app/               Next.js App Router routing (page per feature)
components/        Reusable UI components (primitives + layout)
features/          Feature-specific components (dashboard, students, etc.)
hooks/             Custom hooks (TanStack Query per entity)
lib/               Utilities, Zod validation, constants, export helpers
services/          Repository pattern — communication with Google Apps Script API
types/             Shared TypeScript types
google-apps-script/ Backend code (Code.gs) to deploy to Apps Script
docs/              Spreadsheet/Apps Script setup guide and Vercel deployment instructions

```

---

## 🛠️ Getting Started

### 1. Backend Setup (Spreadsheet + Apps Script)

Follow the complete guide in [`docs/SETUP.md`](https://www.google.com/search?q=./docs/SETUP.md).

### 2. Install & Run Frontend

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_GAS_API_URL in .env.local to your Apps Script deployment URL
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Deployment

Follow the guide in [`docs/DEPLOYMENT.md`](https://www.google.com/search?q=./docs/DEPLOYMENT.md) to deploy to Vercel.

---

## 🧮 How Balances Work

Balances are **not stored** as static columns in the Spreadsheet. Whenever data is required, the backend computes:

```text
Balance = Total Deposits − Total Withdrawals

```

across all rows in the `Ledger` sheet, filtered according to context (per student, per account, per period, etc.).

---

## 🎨 Design

The visual identity is inspired by traditional school accounting ledgers:

* **Colors:** Dark green evoking classic ledger covers, and brass accents resembling official stamps.
* **Typography:** Serif typography (**Fraunces**) for numbers and headings, paired with tabular numerals (**IBM Plex Mono**) across all monetary values for effortless readability and comparison.

---

## 🔮 Future Scalability & Roadmap

This project structure is built to scale smoothly into:

* Multi-user login & admin roles
* Multiple schools / classes / academic years
* Bulk Excel import
* Automated Spreadsheet backups
* Audit logs

---

## 📄 License

Internal project — adapt the license according to your school's requirements.

```

```
