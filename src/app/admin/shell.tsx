"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Glyph } from "./icons";
import { useSiteSettings } from "@/components/site-settings";
import { navigation, viewPath, type View } from "./navigation";

const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Chrome shared by every admin screen: sidebar, top bar and the header band.
 *  Lifted out of the workspace so the record forms render inside the same frame
 *  instead of carrying a second copy of it. */

export const rangeOptions = [
  ["30d", "Last 30 days"],
  ["7d", "Last 7 days"],
  ["90d", "Last 90 days"],
  ["year", "This year"],
  ["all", "All time"],
] as const;

/** Header artwork per view, cropped from the approved page designs. */
export const bannerArt: Partial<Record<View, string>> = {
  Dashboard: "/images/admin/banner-orders.webp",
  Books: "/images/admin/banner-add-book.webp",
  "Book Reviews": "/images/admin/banner-add-book.webp",
  Categories: "/images/admin/banner-categories.webp",
  Orders: "/images/admin/banner-orders.webp",
  Customers: "/images/admin/banner-customers.webp",
  Inventory: "/images/admin/banner-inventory.webp",
  Promotions: "/images/admin/banner-content.webp",
  "Website Content": "/images/admin/banner-content.webp",
  Analytics: "/images/admin/banner-inventory.webp",
  "Media Library": "/images/admin/banner-categories.webp",
  "Book Enquiries": "/images/admin/banner-customers.webp",
  "Team & Access": "/images/admin/banner-customers.webp",
  Settings: "/images/admin/banner-settings.webp",
};

export const subtitles: Partial<Record<View, string>> = {
  Books: "Manage your book collection.",
  "Book Reviews": "Moderate reader ratings and comments before they appear on the storefront.",
  Categories: "Manage and organise your book categories.",
  Orders: "Manage customer orders and track their status.",
  Customers: "Manage your registered customers.",
  Inventory: "Track stock levels and manage inventory.",
  Promotions: "Plan campaigns, offers and featured placements.",
  "Website Content": "Manage homepage banners, featured sections and content.",
  Analytics: "Understand how your catalogue performs.",
  "Media Library": "Every cover asset published on the storefront.",
  "Book Enquiries": "Follow up on the books your readers ask for.",
  "Team & Access": "Control who can manage this workspace.",
  Settings: "Manage your store settings and preferences.",
};

export function AdminShell({
  view,
  title,
  subtitle,
  /** Breadcrumb trail after the home icon; the last entry is the current page. */
  crumbs,
  actions,
  banner,
  orderBadge = 0,
  enquiryBadge = 0,
  children,
}: {
  view: View;
  title: string;
  subtitle?: string;
  crumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
  banner?: string;
  orderBadge?: number;
  enquiryBadge?: number;
  children: ReactNode;
}) {
  const settings = useSiteSettings();
  const router = useRouter();
  const { user } = useUser();
  // The static shell has no Clerk user. Match that first hydration render even
  // when Clerk has already loaded in the browser before this segment streams.
  const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const displayName = (hydrated && (user?.fullName || user?.username)) || "Administrator";

  const [mobile, setMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [topSearch, setTopSearch] = useState("");
  const params = useSearchParams();
  const range = params.get("range") || "all";
  const setRange = (value: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("range", value);
    router.replace(`${viewPath(view)}?${next.toString()}`, { scroll: false });
  };

  const sidebar = useRef<HTMLElement>(null);
  const mobileToggle = useRef<HTMLButtonElement>(null);
  const mainShell = useRef<HTMLDivElement>(null);

  // Mobile drawer: lock the page, trap focus, and restore the trigger on close.
  useEffect(() => {
    if (!mobile) return;
    const shell = mainShell.current;
    const toggle = mobileToggle.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    shell?.setAttribute("inert", "");
    sidebar.current?.querySelector<HTMLElement>("a, button")?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobile(false);
      if (event.key !== "Tab") return;
      const focusable = [...(sidebar.current?.querySelectorAll<HTMLElement>("a, button") || [])]
        .filter((element) => element.getClientRects().length > 0);
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        focusable[0]?.focus();
      }
    }
    function onResize() {
      if (window.innerWidth > 760) setMobile(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      shell?.removeAttribute("inert");
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      toggle?.focus();
    };
  }, [mobile]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "b") {
        event.preventDefault();
        setCollapsed((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={`plbh-admin-app ${collapsed ? "plbh-admin-collapsed" : ""}`}>
      <a className="plbh-admin-skip" href="#admin-main">
        Skip to admin content
      </a>

      <aside
        ref={sidebar}
        id="admin-navigation"
        aria-label="Workspace navigation"
        className={`plbh-admin-sidebar ${mobile ? "is-open" : ""}`}
      >
        <Link href="/admin" className="plbh-admin-brand" aria-label={`${settings.name} admin home`}>
          {settings.logo ? <Image src={settings.logo} alt={settings.name} width={150} height={100} unoptimized /> : settings.name !== "Punjab Law Book House" ? <span className="plbh-admin-custom-brand"><Glyph name="book" size={40} /><strong>{settings.name}</strong><small>ADMIN STUDIO</small></span> : <Image
            src="/images/admin/brand-lockup.webp"
            alt="Punjab Book House — Admin Panel"
            width={420}
            height={272}
            priority
          />}
        </Link>
        <button className="plbh-admin-mobile-close" onClick={() => setMobile(false)} aria-label="Close navigation">
          <Glyph name="left" size={18} />
        </button>
        <nav aria-label="Admin navigation">
          {navigation.map(([name, icon]) => (
            <Link
              key={name}
              href={viewPath(name)}
              title={collapsed ? name : undefined}
              className={view === name ? "active" : ""}
              onClick={() => setMobile(false)}
              aria-current={view === name ? "page" : undefined}
            >
              <Glyph name={icon} size={19} />
              <span>{name}</span>
              {name === "Orders" && orderBadge > 0 && <em className="plbh-admin-nav-badge">{orderBadge}</em>}
              {name === "Book Enquiries" && enquiryBadge > 0 && (
                <em className="plbh-admin-nav-badge">{enquiryBadge}</em>
              )}
            </Link>
          ))}
        </nav>
        <div className="plbh-admin-sidebar-bottom">
          <figure className="plbh-admin-quote">
            <blockquote>
              Good&nbsp;Books
              <br />
              Build
              <br />
              Brighter&nbsp;People.
            </blockquote>
          </figure>
        </div>
      </aside>

      {mobile && (
        <button className="plbh-admin-backdrop is-visible" aria-label="Close navigation" onClick={() => setMobile(false)} />
      )}

      <div ref={mainShell} className="plbh-admin-main">
        <header className="plbh-admin-topbar">
          <button
            ref={mobileToggle}
            className="plbh-admin-menu-button"
            aria-label={mobile ? "Close navigation" : "Open navigation"}
            aria-expanded={mobile}
            aria-controls="admin-navigation"
            onClick={() => {
              if (window.innerWidth <= 760) setMobile(!mobile);
              else setCollapsed(!collapsed);
            }}
          >
            <Glyph name="menu" size={20} />
          </button>
          <div className="plbh-admin-top-context"><small>WORKSPACE</small><strong>{view}</strong></div>
          <form
            className="plbh-admin-topsearch"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              router.push(`${viewPath("Books")}?${new URLSearchParams({ q: topSearch })}`);
            }}
          >
            <Glyph name="search" size={17} />
            <input
              type="search"
              aria-label="Search books"
              placeholder="Search your catalogue…"
              value={topSearch}
              onChange={(event) => setTopSearch(event.target.value)}
            />
          </form>
          <div className="plbh-admin-top-actions">
            <Link className="plbh-admin-store-shortcut" href="/" target="_blank" aria-label="Open storefront in a new tab"><Glyph name="external" size={17} /><span>Storefront</span></Link>
            {(view === "Dashboard" || view === "Analytics") && <label className="plbh-admin-range">
              <Glyph name="calendar" size={17} />
              <span className="plbh-admin-visually-hidden">Date range</span>
              <select value={range} onChange={(event) => setRange(event.target.value)}>
                {rangeOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <Glyph name="down" size={15} />
            </label>}
            <button
              className="plbh-admin-bell"
              aria-label={enquiryBadge > 0 ? `${enquiryBadge} new enquiries` : "No new enquiries"}
              onClick={() => router.push(viewPath("Book Enquiries"))}
            >
              <Glyph name="bell" size={19} />
              {enquiryBadge > 0 && <em>{enquiryBadge}</em>}
            </button>
            <div className="plbh-admin-account">
              {hydrated && <UserButton appearance={{ elements: { userButtonAvatarBox: "plbh-admin-user-avatar", userButtonTrigger: "plbh-admin-user-trigger" } }} />}
              <span>
                {displayName}
                <small>Administrator</small>
              </span>
            </div>
          </div>
        </header>

        <main className="plbh-admin-content" id="admin-main" tabIndex={-1}>
          <div
            className="plbh-admin-page-heading"
            style={{ "--plbh-banner": `url(${banner ?? bannerArt[view] ?? "/images/admin/banner-orders.webp"})` } as React.CSSProperties}
          >
            <div>
              <nav className="plbh-admin-crumbs" aria-label="Breadcrumb">
                <Link href="/admin" aria-label="Dashboard">
                  <Glyph name="home" size={17} />
                </Link>
                {(crumbs ?? (view === "Dashboard" ? [] : [{ label: view }])).map((crumb) => (
                  <span key={crumb.label} className="plbh-admin-crumb">
                    <Glyph name="right" size={14} />
                    {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
                  </span>
                ))}
              </nav>
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
              <span className="plbh-admin-rule" aria-hidden="true" />
            </div>
            {actions && <div className="plbh-admin-heading-actions">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
