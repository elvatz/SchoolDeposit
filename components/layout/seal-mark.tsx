export function SealMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <path
          id="seal-circle-path"
          d="M 50, 50 m -34, 0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0"
        />
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <text fontSize="8.2" letterSpacing="2.5" fontWeight="600" fill="currentColor">
        <textPath href="#seal-circle-path" startOffset="2%">
          BUKU KAS · TABUNGAN SISWA ·
        </textPath>
      </text>
      <g transform="translate(50,50)">
        <path
          d="M -13 1 L -4 10 L 14 -9"
          fill="none"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
