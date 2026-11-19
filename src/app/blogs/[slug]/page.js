import { headingFont } from "@/app/fonts";
import { BlogCategory } from "@/components/BlogCategory";
import { TranslatedBlogContent } from "@/components/TranslatedBlogContent";
import { TranslatedText } from "@/components/TranslatedText";
import { CustomImage, Icon, Section } from "@/components/ui";
import { BLOG_QUERY } from "@/constants/sanity-queries";
import { formatDate } from "@/utils/helpers";
import { sanityFetch, urlFor } from "@/utils/sanity";

const SITE_URL = "https://sarojbartaula.com";
const PERSON_ID = `${SITE_URL}/about#saroj-bartaula`;

export async function generateMetadata({ params }) {
  const blog = await sanityFetch({ query: BLOG_QUERY, params });
  return {
    title: blog?.title,
    description: blog?.shortDescription,
    alternates: {
      canonical: `/blogs/${params.slug}`,
    },
  };
}

const BlogPage = async ({ params }) => {
  const blog = await sanityFetch({ query: BLOG_QUERY, params });
  const canonicalUrl = `${SITE_URL}/blogs/${params.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog?.title,
    description: blog?.shortDescription,
    datePublished: blog?.publishedAt,
    dateModified: blog?._updatedAt || blog?.publishedAt,
    mainEntityOfPage: canonicalUrl,
    image: blog?.blogImage ? urlFor(blog.blogImage) : undefined,
    author: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Saroj Bartaula",
      url: `${SITE_URL}/about`,
    },
    publisher: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Saroj Bartaula",
    },
  };

  return (
    <Section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="mx-auto max-w-3xl">
        <p className="flex items-center gap-1 text-sm text-secondary">
          <Icon icon="clock" />
          {formatDate(blog?.publishedAt)}
        </p>
        <h1
          className={`mb-4 mt-3 text-balance text-2xl font-extrabold md:text-4xl ${headingFont.className}`}
        >
          <TranslatedText text={blog?.title} />
        </h1>
        <BlogCategory categories={blog?.categories} size="lg" />
        <div className="relative mb-8 mt-6 h-56 rounded-lg md:h-72 xl:-mx-14 xl:h-96">
          <CustomImage
            src={urlFor(blog?.blogImage)}
            alt={blog?.title}
            className="absolute !size-full rounded-lg shadow-sm"
          />
        </div>
        <div className="mx-auto max-w-2xl">
          <TranslatedBlogContent
            content={blog?.content}
            slug={params.slug}
            title={blog?.title}
            showListenButton
          />
        </div>
      </div>
    </Section>
  );
};

export default BlogPage;
