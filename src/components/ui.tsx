import type { ReactNode } from "react";
import Link from "next/link";

export type IconName =
  | "book"
  | "scale"
  | "building"
  | "cart"
  | "search"
  | "user"
  | "heart"
  | "arrow"
  | "phone"
  | "truck"
  | "cap"
  | "case"
  | "file"
  | "check"
  | "mail"
  | "pin"
  | "chat"
  | "whatsapp"
  | "menu"
  | "cart-plus"
  | "plus"
  | "minus";
const paths: Record<IconName, ReactNode> = {
  book: (
    <>
      <path d="M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1Z" />
      <path d="M12 5v15" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18M7 21h10M3 7h18M5 7l-4 8h8L5 7Zm14 0-4 8h8l-4-8Z" />
    </>
  ),
  building: (
    <>
      <path d="m2 8 10-6 10 6H2Zm0 13h20M4 18V11m5 7v-7m6 7v-7m5 7v-7" />
    </>
  ),
  cart: (
    <>
      <path d="M2 3h3l3 13h12l2-10H6" />
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
    </>
  ),
  search: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="m15 15 6 6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="7" r="4" />
      <path d="M3 21v-3c0-7 18-7 18 0v3H3Z" />
    </>
  ),
  heart: <path d="M20 4c-4-3-8 1-8 1S8 1 4 4C-3 10 12 21 12 21S27 10 20 4Z" />,
  arrow: <path d="M3 12h18m-6-6 6 6-6 6" />,
  phone: <path d="m7 3 3 5-3 3c1 3 3 5 6 6l3-3 5 3c-1 7-7 5-13-1S1 3 7 3Z" />,
  truck: (
    <>
      <path d="M2 5h12v13H2V5Zm12 5h4l4 5v3h-8" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
    </>
  ),
  cap: (
    <>
      <path d="m1 8 11-5 11 5-11 5L1 8Zm4 2v8c4 3 10 3 14 0v-8M23 8v9" />
    </>
  ),
  case: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M8 7V3h8v4M2 12c5 4 15 4 20 0M12 12v5" />
    </>
  ),
  file: (
    <>
      <path d="M4 2h10l6 6v14H4V2Zm10 0v6h6M8 12h8M8 16h8" />
    </>
  ),
  check: (
    <>
      <path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z" />
      <path d="m7 12 3 3 7-7" />
    </>
  ),
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 5 10 8L22 5" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  chat: (
    <>
      <path d="M21 11a9 9 0 0 1-13 8l-6 3 2-6A9 9 0 1 1 21 11Z" />
      <path d="m8 7 2 3-1 1 3 3 1-1 3 2" />
    </>
  ),
  whatsapp: (
    <path
      fill="currentColor"
      stroke="none"
      d="M20.52 3.48A11.91 11.91 0 0 0 12.05 0C5.47 0 .12 5.35.12 11.93c0 2.1.55 4.16 1.6 5.98L0 24l6.25-1.64a11.9 11.9 0 0 0 5.8 1.48h.01c6.57 0 11.93-5.35 11.94-11.93a11.85 11.85 0 0 0-3.48-8.43ZM12.06 21.82a9.88 9.88 0 0 1-5.04-1.38l-.36-.21-3.71.97.99-3.62-.24-.37a9.89 9.89 0 0 1-1.52-5.28c0-5.46 4.45-9.91 9.92-9.91a9.85 9.85 0 0 1 7.01 2.9 9.85 9.85 0 0 1 2.9 7.02c0 5.46-4.45 9.9-9.95 9.88Zm5.44-7.42c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.63-.93-2.23-.24-.59-.49-.51-.67-.52h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.1 4.49.71.3 1.27.48 1.71.61.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35Z"
    />
  ),
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  "cart-plus": (
    <>
      <path d="M2 3h3l3 13h12l2-10H6" />
      <path d="M14 8v5m-2.5-2.5h5" />
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
};
export function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
export function Button({
  href,
  children,
  variant = "green",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "green" | "gold" | "outline";
  className?: string;
}) {
  return (
    <a className={`button button-${variant} ${className}`} href={href}>
      {children}
      <Icon name="arrow" />
    </a>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  children,
  dark = false,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className={`section-heading ${dark ? "on-dark" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {children && <p className="section-intro">{children}</p>}
    </div>
  );
}
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Punjab Law Book House home">
      <svg
        className="brand-emblem"
        viewBox="0 0 76 76"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M38 3 71 20v39L38 73 5 59V20L38 3Z"
          stroke="currentColor"
          strokeWidth=".6"
          opacity=".45"
        />
        <path
          d="M38 8 66 23v32L38 68 10 55V23L38 8Z"
          stroke="currentColor"
          strokeWidth=".7"
        />
        <path
          d="m18 28 20-12 20 12H18Zm5 5v19m10-19v19m10-19v19m10-19v19M18 54h40"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 58c10-4 18-3 25 2 7-5 15-6 25-2M15 62c9-3 17-2 23 2 6-4 14-5 23-2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M38 20v3m-1.5-1.5h3"
          stroke="currentColor"
          strokeLinecap="round"
        />
      </svg>
      <span>
        Punjab Law
        <br />
        Book House<small>KNOWLEDGE BUILDS A FAIRER PAKISTAN</small>
      </span>
    </Link>
  );
}
