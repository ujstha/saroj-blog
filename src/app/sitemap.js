import { sanityFetch } from "@/utils/sanity";

const BASE_URL = "https://sarojbartaula.com";

const ALL_SLUGS_QUERY = `*[_type == "blog"]{'slug': slug.current, _updatedAt}`;

export default async function sitemap() {
  const blogs = await sanityFetch({ query: ALL_SLUGS_QUERY });

  const blogEntries = (blogs ?? []).map((blog) => ({
    url: `${BASE_URL}/blogs/${blog.slug}`,
    lastModified: blog._updatedAt ? new Date(blog._updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blogs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/buy-me-a-coffee`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...blogEntries,
  ];
}
