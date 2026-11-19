import { headingFont } from "@/app/fonts";
import { T } from "@/components/T";
import { Container, Logo, SocialButtons } from ".";

const profileLinks = [
  { label: "Engineering", href: "https://sbartaula.github.io/" },
  { label: "GitHub", href: "https://github.com/saroj479" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/man-on-mission/" },
];

export const Footer = () => {
  return (
    <footer className="relative mt-16 overflow-hidden border-t bg-[linear-gradient(180deg,rgba(var(--background-color-rgb),0.35),rgba(var(--tertiary-color-rgb),0.88))] border-primary-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(var(--accent-color-1-rgb),0.14),transparent_60%)]" />
      <Container className="relative grid gap-8 py-10 md:grid-cols-[1.2fr_1fr] md:items-end md:py-14">
        <div className="max-w-xl">
          <Logo className="!w-24 bg-transparent md:!w-32" />
          <p className="mt-4 text-[11px] uppercase tracking-[0.34em] text-secondary">
            Personal archive
          </p>
          <T
            k="footer.tagline"
            fallback="The Man on a Mission"
            as="p"
            className={`${headingFont.className} mt-2 text-2xl tracking-[0.08em] text-primary md:text-3xl`}
          />
          <p className="mt-3 max-w-md text-sm leading-7 text-secondary md:text-base">
            Thoughts on technology, storytelling, science, and making meaningful
            things that move ideas forward.
          </p>
        </div>
        <div className="border-primary/10 bg-background/75 rounded-[28px] border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
          <p className="text-[11px] uppercase tracking-[0.32em] text-secondary">
            Find Saroj
          </p>
          <SocialButtons />
          <nav
            aria-label="Profile links"
            className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold tracking-[0.14em] text-primary"
          >
            {profileLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="underline-offset-4 transition hover:text-accent1 hover:underline"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <span
            aria-disabled="true"
            title="Milky Way Market is temporarily unavailable"
            className="border-primary/10 bg-primary/5 text-secondary/60 mt-5 inline-flex cursor-not-allowed rounded-full border px-4 py-2 text-sm font-semibold tracking-[0.12em]"
          >
            Milky Way Market · Temporarily unavailable
          </span>
        </div>
      </Container>
      <Container className="border-primary/10 relative flex flex-col items-center justify-between gap-2 border-t py-5 text-center md:flex-row md:text-left">
        <T
          k="footer.copyright"
          fallback="Copyright © 2024. Saroj Bartaula."
          as="span"
          className="text-sm text-secondary"
        />
        <p className="text-secondary/80 text-[11px] uppercase tracking-[0.28em]">
          Built for clarity across laptop and mobile
        </p>
      </Container>
    </footer>
  );
};
