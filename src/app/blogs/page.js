import { BlogCategoryItem } from "@/components/BlogCategory";
import { BlogSortFilter } from "@/components/BlogSortFilter";
import { BlogItem } from "@/components/section";
import { T } from "@/components/T";
import { Container, Section } from "@/components/ui";
import {
    BLOG_BY_CATEGORY_POPULAR_QUERY,
    BLOG_BY_CATEGORY_QUERY,
    CATEGORIES_QUERY,
    PARTIAL_BLOGS_QUERY,
    POPULAR_BLOGS_QUERY,
} from "@/constants/sanity-queries";
import { sanityFetch } from "@/utils/sanity";
import { Suspense } from "react";
import { headingFont } from "../fonts";

const Blogs = async ({ searchParams }) => {
  let blogs = [];
  const { category, sort = "recent" } = searchParams;
  const isPopular = sort === "popular";
  const categoryRegex = `^${category}$`;

  const categories = await sanityFetch({ query: CATEGORIES_QUERY });

  if (category) {
    blogs = await sanityFetch({
      query: isPopular ? BLOG_BY_CATEGORY_POPULAR_QUERY : BLOG_BY_CATEGORY_QUERY,
      params: { category: categoryRegex },
    });
  } else {
    blogs = await sanityFetch({
      query: isPopular ? POPULAR_BLOGS_QUERY : PARTIAL_BLOGS_QUERY,
    });
  }

  return (
    <Section className="pt-4 md:pt-6">
      <Container>
        <div className="mb-8 flex flex-col gap-3 md:mb-10">
          <p className="text-[11px] uppercase tracking-[0.34em] text-secondary">
            Browse the archive
          </p>
          <h1
            className={`text-3xl font-bold capitalize tracking-[0.06em] md:text-5xl ${headingFont.className}`}
          >
            {category ?? "Recent"} blogs
          </h1>
        </div>

        {/* Sort filter: Recent / Popular */}
        <Suspense fallback={null}>
          <BlogSortFilter category={category} />
        </Suspense>

        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:gap-8">
          <div className="grid w-full grid-cols-1 gap-5 lg:w-[68%]">
            {blogs?.length === 0 && (
              <div className="w-full">
                <T k="blog.notAvailable" fallback="Blogs are not available" />
              </div>
            )}
            {blogs?.map((blog) => (
              <BlogItem key={blog?.slug} blog={blog} />
            ))}
          </div>
          <div className="border-primary/10 bg-background/75 w-full rounded-[28px] border p-5 shadow-[0_18px_44px_rgba(10,18,28,0.06)] lg:sticky lg:top-24 lg:w-[32%]">
            <p className="mb-2 text-[11px] uppercase tracking-[0.32em] text-secondary">
              Filters
            </p>
            <h2 className="mb-4 text-xl font-bold text-primary">
              <T k="blog.exploreCategories" fallback="Explore Categories" />
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {categories?.map(({ title }) => (
                <BlogCategoryItem key={title} category={title} size="lg" />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Blogs;
