"use client";
import Link from "next/link";
import { useSiteSettings } from "./site-settings";
import { Suspense } from "react";
import catalogue from "@/data/catalogue.json";
import { Brand, Icon } from "./ui";
import { DesktopNavigation } from "./premium-navigation";
import { NavbarSearch } from "./navbar-search";
import { HeaderCart } from "./header-cart";
import { MobileMenu } from "./store-interactions";
export function SiteHeader() {
  const settings = useSiteSettings();
  return (
    <>
      {" "}
      <Link className="skip-link" href="#main">
        Skip to content
      </Link>{" "}
      <header className="site-header premium-header" data-section="01-header">
        <div className="announcement">
          <div className="container announcement-inner">
            <span>
              <Icon name="book" />
              {settings.announcement}
            </span>
            <span>
              <Icon name="truck" />
              Delivering across Pakistan
            </span>
            <Link href={`tel:${settings.phone.replace(/[^+0-9]/g, "")}`}>
              <Icon name="phone" />
              For enquiries: {settings.phone}
            </Link>
          </div>
        </div>
        <div className="container navigation">
          <Brand />
          <Suspense fallback={<nav aria-label="Main navigation"><Link href="/products">Bookshop</Link></nav>}><DesktopNavigation /></Suspense>
          <NavbarSearch />
          <div className="header-actions">
            <Link
              className="icon-button account-link"
              href="/account"
              aria-label="My account"
            >
              <Icon name="user" />
            </Link>
            <HeaderCart />
            <MobileMenu />
          </div>
          <Link
            className="browse-button button button-gold"
            href="/collections"
          >
            <Icon name="book" />
            Browse Categories
          </Link>
        </div>
      </header>
    </>
  );
}
export function SiteFooter() {
  const settings = useSiteSettings();
  return (
    <footer className="site-footer" data-section="12-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>
            {settings.description}
          </p>
          <div className="footer-social-links">
            {settings.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer">Facebook</a>}
            {settings.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer">Instagram</a>}
          </div>
          <Link className="text-link" href={`https://wa.me/${settings.whatsapp}`}>
            <Icon name="whatsapp" />
            Talk to us on WhatsApp
          </Link>
        </div>
        <div>
          <h2>Quick Links</h2>
          <Link href="/">Home</Link>
          <Link href="/products">All Books</Link>
          <Link href="/products">Browse the Collection</Link>
          <Link href="/collections/exam-guides">Exam Guides</Link>
          <Link href="/about">About Us</Link>
        </div>
        <div>
          <h2>Book Categories</h2>
          <Link href="/collections/exam-guides">Exam Guides</Link>
          <Link href={`/collections/students`}>LLB Books</Link>
          <Link href={`/collections/bare-acts`}>Bare Acts</Link>
          <Link href={`/collections/legal-reference`}>Manuals</Link>
          <Link href={`/products`}>Law Books</Link>
        </div>
        <div>
          <h2>Help &amp; Support</h2>
          <Link href="/delivery">Delivery Information</Link>
          <Link href="/returns">Returns &amp; Support</Link>
          <Link href="/help">Ordering &amp; Delivery</Link>
          <Link href="/account">My Account</Link>
          <Link href="/wishlist">Saved Books</Link>
          <Link href="/cart">Shopping Cart</Link>
          <Link href="/request-a-book">Request a Book</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href={`/terms`}>Terms &amp; Conditions</Link>
          <Link href={`/privacy`}>Privacy Policy</Link>
        </div>
        <div className="footer-contact">
          <h2>Contact Us</h2>
          <p>
            <Icon name="pin" />
            <span>
              {settings.address}<br />{settings.city}, {settings.country}
            </span>
          </p>
          <Link href={`tel:${settings.phone.replace(/[^+0-9]/g, "")}`}>
            <Icon name="phone" />
            {settings.phone}
          </Link>
          <Link href={`mailto:${settings.email}`}>
            <Icon name="mail" />
            <span>{settings.email}</span>
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© {catalogue.verifiedAt.slice(0, 4)} {settings.name}.</p>
        <p>
          {settings.tagline}
        </p>
        <Link href="#main">Back to top ↑</Link>
      </div>
    </footer>
  );
}
