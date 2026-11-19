/* eslint-disable tailwindcss/no-custom-classname */
"use client";

import { headingFont } from "@/app/fonts";
import Link from "next/link";
import { useState } from "react";
import { LanguageSwitcher, ThemeToggle } from ".";
import { Container } from "./Container";
import { Logo } from "./Logo";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-xl will-change-transform bg-background-80 border-primary-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--accent-color-1-rgb),0.7),transparent)]" />
      <Container className="flex items-center justify-between py-2.5 md:py-3">
        <div className="flex items-center gap-3">
          <Logo className="!w-24 bg-transparent md:!w-28" />
          <div className="hidden md:block">
            <p className="text-[10px] uppercase tracking-[0.34em] text-secondary">
              Ideas in Motion
            </p>
            <p
              className={`${headingFont.className} text-primary/90 text-sm tracking-[0.14em]`}
            >
              Journal, Films, Code
            </p>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-x-3 md:flex">
          <ul className="border-primary/10 bg-background/90 flex items-center gap-1 rounded-full border px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
            <li>
              <Link
                href="/about"
                className="animation hover:bg-accent1/10 rounded-full px-4 py-2.5 text-sm font-medium tracking-[0.14em] text-secondary hover:text-primary"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href={`/blogs`}
                className="animation hover:bg-accent1/10 rounded-full px-4 py-2.5 text-sm font-medium tracking-[0.14em] text-secondary hover:text-primary"
              >
                Blogs
              </Link>
            </li>
          </ul>
          <LanguageSwitcher />
          <ThemeToggle />
          <span
            aria-disabled="true"
            title="Milky Way Market is temporarily unavailable"
            className="border-primary/10 bg-primary/5 text-secondary/60 cursor-not-allowed rounded-full border px-4 py-2.5 text-sm font-semibold tracking-[0.12em]"
          >
            Shop <span className="sr-only">— temporarily unavailable</span>
          </span>
          <Link href="/buy-me-a-coffee">
            <button className="rounded-full bg-[linear-gradient(135deg,rgba(var(--primary-text-color-rgb),0.96),rgba(var(--accent-color-1-rgb),0.82))] px-4 py-2.5 text-sm font-semibold tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(10,18,28,0.16)]">
              Buy Me a Coffee
            </button>
          </Link>
        </nav>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="border-primary/10 bg-background/90 hover:bg-accent1/10 flex size-11 items-center justify-center rounded-2xl border transition md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </Container>

      {/* Mobile dropdown menu */}
      {isOpen && (
        <div className="border-primary/10 bg-background/95 border-t backdrop-blur-xl md:hidden">
          <Container className="flex flex-col gap-3 py-4">
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="animation border-primary/10 bg-background/90 hover:bg-accent1/10 rounded-2xl border px-4 py-3 font-medium tracking-[0.12em] text-primary"
            >
              About
            </Link>
            <Link
              href="/blogs"
              onClick={() => setIsOpen(false)}
              className="animation border-primary/10 bg-background/90 hover:bg-accent1/10 rounded-2xl border px-4 py-3 font-medium tracking-[0.12em] text-primary"
            >
              Blogs
            </Link>
            <div className="flex items-center gap-3 p-1">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <span
              aria-disabled="true"
              className="border-primary/10 bg-primary/5 text-secondary/60 cursor-not-allowed rounded-2xl border px-4 py-3 text-center text-sm font-semibold tracking-[0.12em]"
            >
              Shop · Temporarily unavailable
            </span>
            <Link
              href="/buy-me-a-coffee"
              onClick={() => setIsOpen(false)}
              className="rounded-2xl bg-[linear-gradient(135deg,rgba(var(--primary-text-color-rgb),0.96),rgba(var(--accent-color-1-rgb),0.82))] px-4 py-3 text-center text-sm font-semibold tracking-[0.12em] text-white transition hover:shadow-[0_12px_24px_rgba(10,18,28,0.16)]"
            >
              Buy Me a Coffee
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
};
