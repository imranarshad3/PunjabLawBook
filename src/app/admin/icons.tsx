import type { ReactNode } from "react";

export function Glyph({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    book: (
      <>
        <path d="M12 5v16M12 5C8 2 4 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-4-1-7-1-10 1Z" />
        <path d="m5 8 4 1m6 0 4-1" />
      </>
    ),
    bag: (
      <>
        <path d="M4 7h16l1 14H3L4 7Z" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M2 21v-3a7 7 0 0 1 14 0v3M16 4a3 3 0 0 1 0 6m3 4c2 1 3 3 3 6" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v18h18M8 16v-5m5 5V6m5 10V9" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m9 3 6 0 1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3Z" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6.5" />
        <path d="m15 15 6 6" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    external: (
      <>
        <path d="M14 3h7v7m0-7L10 14M10 4H4v16h16v-6" />
      </>
    ),
    bell: (
      <>
        <path d="M5 17h14l-2-4V8a5 5 0 0 0-10 0v5l-2 4Zm5 3h4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    down: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 11h18" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <path d="M16 10h5v5h-5zM3 9h18" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.book}
    </svg>
  );
}
