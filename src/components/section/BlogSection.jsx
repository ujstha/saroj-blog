import { headingFont } from "@/app/fonts";
import { T } from "@/components/T";
import { TranslatedText } from "@/components/TranslatedText";
import { PARTIAL_BLOGS_QUERY } from "@/constants/sanity-queries";
import { formatDate } from "@/utils/helpers";
import { sanityFetch, urlFor } from "@/utils/sanity";
import Link from "next/link";
import { BlogCategory } from "../BlogCategory";
import { Container, CustomImage, Icon, Section } from "../ui";
import { HighlightedSection } from "./HighlightedSection";

export const BlogItem = ({ blog }) => {
  return (
    <article>
      <Link
        href={`/blogs/${blog?.slug}`}
        as={`/blogs/${blog?.slug}`}
        title={blog?.title}
        className="border-primary/10 bg-background/80 animation hover:border-accent1/20 flex h-full flex-col gap-4 overflow-hidden rounded-[24px] border p-3 shadow-[0_18px_40px_rgba(10,18,28,0.05)] backdrop-blur-sm hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(10,18,28,0.09)] md:p-4"
      >
        <CustomImage
          src={urlFor(blog?.blogImage)}
          alt={blog?.title}
          className="!h-48 !w-full overflow-hidden rounded-[18px] object-cover md:!h-52"
        />
        <div className="flex flex-1 flex-col">
          <p className="mb-2 flex items-center gap-x-1 text-xs uppercase tracking-[0.18em] text-secondary">
            <Icon icon="clock" />
            {formatDate(blog?.publishedAt)}
          </p>
          <h3
            className={`line-clamp-2 text-xl font-bold !leading-tight md:text-2xl ${headingFont.className}`}
          >
            <TranslatedText text={blog?.title} />
          </h3>
          <BlogCategory categories={blog?.categories} />
          <p className="mt-4 line-clamp-4 text-sm leading-7 text-secondary md:text-base">
            <TranslatedText text={blog?.shortDescription} />
          </p>
          <div className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Read article
          </div>
        </div>
      </Link>
    </article>
  );
};

export const BlogSection = async () => {
  const blogs = await sanityFetch({ query: PARTIAL_BLOGS_QUERY });

  return (
    <>
      <HighlightedSection blog={blogs[1]} />
      <Section className="pt-4 md:pt-6">
        <Container>
          <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.34em] text-secondary">
                Fresh from the archive
              </p>
              <h2 className={`text-3xl font-bold tracking-[0.06em] md:text-4xl ${headingFont.className}`}>
                <T k="blog.recentBlogs" fallback="Recent Blogs" />
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-7 text-secondary md:text-base">
              A curated stream of recent writing across technology, storytelling, science, and adjacent ideas.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:gap-6">
            {blogs?.map((blog) => (
              <BlogItem key={blog?.slug} blog={blog} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
};
