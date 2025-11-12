/* eslint-disable tailwindcss/no-custom-classname */
import Link from "next/link";
import { ThemeToggle } from ".";
import { Container } from "./Container";
import { Logo } from "./Logo";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-background">
      <Container className="flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-x-4">
          <ul>
            <li>
              <Link
                href={`/blogs`}
                className="animation tracking-wide underline-offset-0 hover:text-accent1 hover:underline hover:underline-offset-4"
              >
                Blogs
              </Link>
            </li>
          </ul>
          <ThemeToggle />
          <a
            href="https://milkywaymarket.shop/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 rounded bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
          >
            Shop
          </a>
          <Link href="/buy-me-a-coffee">
            <button className="ml-4 rounded bg-yellow-400 px-4 py-2 font-semibold text-black transition hover:bg-yellow-500">
              Buy Me a Coffee
            </button>
          </Link>
        </nav>
      </Container>
    </header>
  );
};
