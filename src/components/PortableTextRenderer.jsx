import { CustomImage } from "@/components/ui/CustomImage";
import { urlFor } from "@/utils/sanity";
import { PortableText } from "@portabletext/react";
import Link from "next/link";

/**
 * PortableTextRenderer
 * Reusable component to render Sanity Portable Text arrays (field `body`).
 *
 * Usage:
 * <PortableTextRenderer value={post.body} />
 *
 * Notes:
 * - Uses `urlFor()` (src/utils/sanity.js) to resolve Sanity image assets.
 * - Uses the project's `CustomImage` (next/image wrapper) for consistent image handling.
 */
export const PortableTextRenderer = ({ value }) => {
  if (!value) return null;

  const components = {
    block: {
      h1: ({ children }) => (
        <h1 className="mb-4 text-3xl font-bold leading-tight">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="mb-3 text-2xl font-semibold leading-tight">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="mb-2 text-xl font-medium">{children}</h3>
      ),
      normal: ({ children }) => (
        <p className="mb-4 text-base leading-7 text-secondary">{children}</p>
      ),
      blockquote: ({ children }) => (
        <blockquote className="my-4 border-l-2 pl-4 italic text-secondary">{children}</blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className="mb-4 ml-6 list-disc">{children}</ul>
      ),
      number: ({ children }) => (
        <ol className="mb-4 ml-6 list-decimal">{children}</ol>
      ),
    },
    types: {
      image: ({ value }) => {
        // value is the whole image object from Sanity
        const src = urlFor(value);
        const alt = value?.alt || value?.caption || "";
        if (!src) return null;

        return (
          <div className="my-6">
            <CustomImage src={src} alt={alt} className="h-auto w-full rounded" />
            {value?.caption && (
              <p className="mt-2 text-sm text-secondary">{value.caption}</p>
            )}
          </div>
        );
      },
      code: ({ value }) => (
        <pre className="my-4 overflow-auto rounded bg-neutral-900 p-4 text-sm text-white">{value.code}</pre>
      ),
    },
    marks: {
      link: ({ children, value }) => {
        const href = value?.href || "";
        const isExternal = href && !href.startsWith("/");
        if (isExternal) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent1 underline"
            >
              {children}
            </a>
          );
        }

        // internal link
        return (
          <Link href={href} className="text-accent1 underline">
            {children}
          </Link>
        );
      },
      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
    },
  };

  return <PortableText value={value} components={components} />;
};

export default PortableTextRenderer;
