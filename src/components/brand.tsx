"use client";
import Image from "next/image";
import Link from "next/link";
import { useSiteSettings } from "./site-settings";

export function Brand() {
  const settings = useSiteSettings();
  return (
    <Link className="brand" href="/" aria-label={`${settings.name} home`}>
      {settings.logo ? <Image className="brand-emblem" src={settings.logo} alt="" width={76} height={76} unoptimized /> : <svg
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
      </svg>}
      <span>
        {settings.name === "Punjab Law Book House" ? <>Punjab Law<br />Book House</> : settings.name}
        <small>{settings.tagline}</small>
      </span>
    </Link>
  );
}
