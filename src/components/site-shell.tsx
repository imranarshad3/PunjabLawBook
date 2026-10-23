import Link from "next/link";
import { Suspense } from "react";
import catalogue from "@/data/catalogue.json";
import { Brand, Icon } from "./ui";
import { DesktopNavigation } from "./premium-navigation";
import { NavbarSearch } from "./navbar-search";
import { HeaderCart } from "./header-cart";
import { MobileMenu } from "./store-interactions";
export function SiteHeader() {
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
              Legal booksellers &amp; publishers
            </span>
            <span>
              <Icon name="truck" />
              Delivering across Pakistan
            </span>
            <Link href="tel:+923334222005">
              <Icon name="phone" />
              For enquiries: +92 333 4222005
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
  return (
    <footer className="site-footer" data-section="12-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>
            Legal books, guides and professional resources. Supporting study,
            practice and a deeper understanding of the law.
          </p>
          <Link className="text-link" href="https://wa.me/923334222005">
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
              1-Turner Road,
              <br />
              Behind High Court,
              <br />
              Lahore, Pakistan
            </span>
          </p>
          <Link href="tel:+923334222005">
            <Icon name="phone" />
            +92 333 4222005
          </Link>
          <Link href="mailto:civilcriminallawbook@gmail.com">
            <Icon name="mail" />
            <span>civilcriminallawbook@gmail.com</span>
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© {catalogue.verifiedAt.slice(0, 4)} Punjab Law Book House.</p>
        <p>
          Knowledge for a <em>fairer Pakistan.</em>
        </p>
        <Link href="#main">Back to top ↑</Link>
      </div>
    </footer>
  );
}
