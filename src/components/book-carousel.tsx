"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Icon } from "./ui";

export function BookCarousel({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [ends, setEnds] = useState({ start: true, end: false });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () =>
      setEnds({
        start: element.scrollLeft < 2,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, []);
  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const card = element.firstElementChild?.getBoundingClientRect();
    const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0;
    const step = (card?.width ?? element.clientWidth) + gap;
    element.scrollTo({
      left: Math.max(
        0,
        (Math.round(element.scrollLeft / step) + direction) * step,
      ),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <div className="book-carousel" role="region" aria-label="Bestselling books">
      <div className="carousel-actions">
        <button
          type="button"
          className="carousel-arrow previous"
          aria-label="Previous bestselling books"
          aria-controls="bestseller-track"
          disabled={ends.start}
          onClick={() => move(-1)}
        >
          <Icon name="arrow" />
        </button>
        <button
          type="button"
          className="carousel-arrow"
          aria-label="Next bestselling books"
          aria-controls="bestseller-track"
          disabled={ends.end}
          onClick={() => move(1)}
        >
          <Icon name="arrow" />
        </button>
        <Link className="button button-green" href="/collections/bestsellers">
          View All Bestsellers <Icon name="arrow" />
        </Link>
      </div>
      <div
        className="bestseller-track"
        id="bestseller-track"
        ref={track}
        tabIndex={0}
        aria-label="Scroll through bestselling books"
      >
        {children}
      </div>
    </div>
  );
}
