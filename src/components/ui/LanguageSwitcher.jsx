"use client";

/* eslint-disable tailwindcss/classnames-order */

import { useLanguage } from "@/providers/LanguageProvider";
import { useEffect, useRef, useState } from "react";

export const LanguageSwitcher = () => {
  const { language, setLanguage, languages, mounted } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click / escape — only listen when open
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  if (!mounted) {
    return <div className="h-11 w-20 rounded-full bg-accent1-10" />;
  }

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Switch language"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="border-primary/10 bg-background/90 flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition-colors hover:border-accent1/25 hover:bg-accent1/10"
      >
        <GlobeIcon />
        <span className="hidden sm:inline">{currentLang.flag}</span>
        <span className="text-xs uppercase tracking-[0.18em]">{currentLang.code}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          className="border-primary/10 bg-background absolute right-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-3xl border shadow-[0_18px_50px_rgba(10,18,28,0.14)] backdrop-blur-xl"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={language === lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-accent1-10 ${
                language === lang.code
                  ? "bg-accent1-5 font-semibold text-accent1"
                  : ""
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
              {language === lang.code && (
                <CheckIcon className="ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function GlobeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-accent1"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon({ className = "" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-accent1 ${className}`}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
