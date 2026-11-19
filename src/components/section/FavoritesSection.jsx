import { headingFont } from "@/app/fonts";
import { favoriteCollections } from "@/constants/favorites";
import { Container, Section } from "../ui";

// eslint-disable-next-line tailwindcss/classnames-order
const favoriteCardClassName =
  "relative overflow-hidden rounded-[24px] border bg-background/85 border-primary/10 p-4 shadow-[0_14px_34px_rgba(10,18,28,0.05)] md:p-5";
// eslint-disable-next-line tailwindcss/classnames-order
const cardIndexClassName =
  "absolute right-4 top-4 font-semibold uppercase tracking-[0.2em] text-[10px] text-secondary/70";

export const FavoritesSection = () => {
  return (
    <Section className="relative overflow-hidden py-3 md:pt-5">
      <div className="pointer-events-none absolute left-0 top-8 size-40 rounded-full bg-[radial-gradient(circle,rgba(var(--accent-color-1-rgb),0.2),transparent_65%)] blur-2xl" />
      <Container className="relative">
        <div className="border-primary/10 bg-background/75 overflow-hidden rounded-[30px] border p-5 shadow-[0_24px_52px_rgba(10,18,28,0.08)] backdrop-blur-sm md:p-8">
          <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.34em] text-secondary">
                A little more personal
              </p>
              <h2
                className={`mt-2 text-3xl font-bold tracking-[0.04em] md:text-4xl ${headingFont.className}`}
              >
                Things I Love
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-secondary md:text-base">
              A living list of podcasts, books, movies, and series that shape
              how I think and what I keep coming back to.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {favoriteCollections.map((collection, index) => (
              <article
                key={collection.title}
                className={favoriteCardClassName}
              >
                <div className={cardIndexClassName}>
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3
                  className={`pr-10 text-xl font-bold leading-tight md:text-2xl ${headingFont.className}`}
                >
                  {collection.title}
                </h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-secondary md:text-[11px]">
                  {collection.subtitle}
                </p>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {collection.items.map((item) => (
                    <li
                      key={item}
                      className="border-primary/10 bg-tertiary/80 rounded-full border px-3 py-2 text-xs font-medium uppercase tracking-[0.08em] text-primary md:text-[13px]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
};
