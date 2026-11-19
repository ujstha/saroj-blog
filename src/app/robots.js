const BASE_URL = "https://sarojbartaula.com";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/thank-you"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
