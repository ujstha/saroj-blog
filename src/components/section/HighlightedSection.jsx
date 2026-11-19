import { headingFont } from "@/app/fonts";
import { T } from "@/components/T";
import { TranslatedText } from "@/components/TranslatedText";
import { formatDate } from "@/utils/helpers";
import { urlFor } from "@/utils/sanity";
import Link from "next/link";
import { BlogCategory } from "../BlogCategory";
import { Container, CustomImage, Icon, Section } from "../ui";

export const HighlightedSection = ({ blog }) => {
  return (
    <Section className="relative overflow-hidden pt-4 md:pt-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[linear-gradient(180deg,rgba(var(--accent-color-1-rgb),0.06),transparent_70%)]" />
      <Container>
        <article className="border-primary/10 bg-background/75 relative mx-auto flex h-auto max-w-5xl flex-col overflow-hidden rounded-[28px] border p-4 shadow-[0_24px_60px_rgba(10,18,28,0.08)] backdrop-blur-md sm:p-5 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8 lg:p-7">
          <div className="order-2 mt-4 lg:order-1 lg:mt-0">
            <p className="mb-2 text-[11px] uppercase tracking-[0.32em] text-secondary">
              Featured entry
            </p>
            <p className="flex items-center gap-1 text-xs text-secondary">
              <Icon icon="clock" />
              {formatDate(blog?.publishedAt)}
            </p>
            <div
              className={`mt-3 text-2xl font-bold !leading-tight md:text-3xl ${headingFont.className}`}
            >
              <TranslatedText text={blog?.title} />
            </div>
            <BlogCategory categories={blog?.categories} />
            <p className="mt-4 max-w-xl text-sm leading-7 text-secondary sm:line-clamp-4 md:text-base">
              <TranslatedText text={blog?.shortDescription} />
            </p>
            <Link
              href={`/blogs/${blog?.slug}`}
              className="animation border-accent1/20 bg-accent1/10 hover:bg-accent1/15 mt-6 inline-flex min-h-11 items-center rounded-full border px-5 py-2.5 text-sm font-semibold tracking-[0.14em] text-primary hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(var(--accent-color-1-rgb),0.12)]"
            >
              <T k="blog.exploreMore" fallback="Explore more" />
            </Link>
          </div>
          <CustomImage
            src={urlFor(blog?.blogImage)}
            alt={blog?.title}
            className="lg:animation order-1 !h-52 !w-full overflow-hidden rounded-[22px] object-cover sm:!h-64 lg:order-2 lg:!h-[22rem] lg:!w-full lg:!min-w-0"
          />
        </article>
      </Container>
    </Section>
  );
};
