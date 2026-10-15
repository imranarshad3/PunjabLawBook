"use client";
import { useEffect, useId, useRef, useState } from "react";
const options = [
  {
    value: "featured",
    label: "Featured collection",
    note: "Our considered selection",
  },
  {
    value: "price-low",
    label: "Price: low to high",
    note: "Start with an affordable reference",
  },
  {
    value: "price-high",
    label: "Price: high to low",
    note: "Explore the collection by value",
  },
  { value: "title", label: "Title: A–Z", note: "Find your way alphabetically" },
];
export function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  function focusOption(index: number) {
    requestAnimationFrame(() =>
      root.current
        ?.querySelectorAll<HTMLButtonElement>('[role="option"]')
        [index]?.focus(),
    );
  }
  return (
    <div
      className="sort-dropdown"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          trigger.current?.focus();
        }
        if (
          open &&
          ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
        ) {
          event.preventDefault();
          const items = [
            ...root.current!.querySelectorAll<HTMLButtonElement>(
              '[role="option"]',
            ),
          ];
          const index = items.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          focusOption(
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? items.length - 1
                : (index +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    items.length) %
                  items.length,
          );
        }
      }}
    >
      <span id={`${id}-label`}>Sort by</span>
      <button
        ref={trigger}
        className="sort-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-label={`Sort books: ${options.find((option) => option.value === value)?.label}`}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (!open && event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            focusOption(options.findIndex((option) => option.value === value));
          }
        }}
      >
        {options.find((option) => option.value === value)?.label}
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="m3 4 3 3 3-3" />
        </svg>
      </button>
      {open && (
        <div
          className="sort-options"
          role="listbox"
          id={`${id}-options`}
          aria-labelledby={`${id}-label`}
        >
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={value === option.value}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <span>
                <strong>{option.label}</strong>
                <small>{option.note}</small>
              </span>
              <span className="sort-check" aria-hidden="true">
                {value === option.value ? "✓" : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
