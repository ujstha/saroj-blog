import { cleanTextChildren } from "@/utils/helpers";
import { urlFor } from "@/utils/sanity";
import Link from "next/link";
import { Children } from "react";
import { CustomImage, Icon } from ".";

function getChildText(children) {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child;
      if (child?.props?.children) return getChildText(child.props.children);
      return "";
    })
    .join("");
}

// A "normal" block whose only non-empty spans are marked as inline `code`
// (e.g. `action = walking`) is a stacked code sample, not prose.
function isCodeOnlyLine(value) {
  const spans = value?.children?.filter((child) => child._type === "span") || [];
  const textSpans = spans.filter((span) => span.text?.trim().length > 0);
  if (textSpans.length === 0) return false;
  return textSpans.every((span) => span.marks?.includes("code"));
}

export const RichText = {
  types: {
    image: ({ value }) => {
      return (
        <div className="my-6">
          <div className="h-44 rounded-lg sm:h-48">
            <CustomImage
              src={urlFor(value)}
              alt={value.alt}
              className={`mx-auto !size-full rounded-lg shadow-lg`}
            />
          </div>
          {value?.caption && (
            <p className="mt-2 text-center text-sm italic text-secondary">
              {value.caption}
            </p>
          )}
        </div>
      );
    },
    code: ({ value }) => (
      <pre className="my-6 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-white">
        <code>{value.code}</code>
      </pre>
    ),
  },

  block: {
    h1: ({ children }) => (
      <h1 className="mb-5 mt-10 text-balance text-2xl font-bold leading-tight text-primary md:text-3xl">
        {cleanTextChildren(children)}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-10 text-balance text-xl font-bold leading-tight text-primary md:text-2xl">
        {cleanTextChildren(children)}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 text-balance text-lg font-semibold leading-snug text-primary md:text-xl">
        {cleanTextChildren(children)}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-3 mt-6 text-base font-semibold leading-snug text-primary md:text-lg">
        {cleanTextChildren(children)}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="mb-2 mt-5 text-base font-medium leading-snug text-primary">
        {cleanTextChildren(children)}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="mb-2 mt-5 text-sm font-medium uppercase leading-snug tracking-wide text-primary">
        {cleanTextChildren(children)}
      </h6>
    ),
    blockquote: ({ children }) => (
      <blockquote className="relative mx-auto my-8 max-w-xl whitespace-pre-wrap rounded-lg border px-8 py-5 text-center text-lg italic leading-relaxed border-accent1-40">
        <span className="absolute -top-3 left-2 bg-background p-0.5 text-accent1">
          <Icon icon="quote" />
        </span>
        {cleanTextChildren(children)}
      </blockquote>
    ),
    normal: ({ children, value }) => {
      const text = getChildText(children);
      // Skip truly empty blocks instead of rendering them as full blank paragraphs,
      // which otherwise stack extra whitespace between paragraphs on wide screens.
      if (text.trim().length === 0) return null;

      // Short "key = value" style lines (e.g. rendered entirely as inline `code`)
      // read like a stacked code sample, not standalone paragraphs — use tight
      // spacing between them instead of full paragraph gaps.
      if (isCodeOnlyLine(value)) {
        return (
          <p className="mb-1.5 text-sm leading-6 text-secondary md:text-base">
            {cleanTextChildren(children)}
          </p>
        );
      }

      return (
        <p className="mb-5 whitespace-pre-wrap text-base leading-8 tracking-normal text-secondary md:mb-6 md:text-lg md:leading-8">
          {cleanTextChildren(children)}
        </p>
      );
    },
  },

  list: {
    bullet: ({ children }) => (
      <ul className="mb-6 ml-6 list-disc space-y-3 text-base leading-8 md:text-lg">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-6 ml-6 list-decimal space-y-3 text-base leading-8 md:text-lg">
        {children}
      </ol>
    ),
  },

  listItem: {
    bullet: ({ children }) => (
      <li className="whitespace-pre-wrap leading-8 text-secondary">{cleanTextChildren(children)}</li>
    ),
    number: ({ children }) => (
      <li className="whitespace-pre-wrap leading-8 text-secondary">{cleanTextChildren(children)}</li>
    ),
  },

  marks: {
    link: ({ children, value }) => {
      const selfLink = value.href.startsWith("/");
      const rel = !selfLink ? "noreferrer noopener" : undefined;
      const target = !selfLink ? "_blank" : "";
      return (
        <Link
          href={value.href}
          rel={rel}
          target={target}
          className="animation font-medium text-accent1 underline-offset-0 hover:underline hover:underline-offset-2"
        >
          {children}
        </Link>
      );
    },
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-neutral-200 px-1.5 py-0.5 font-mono text-sm dark:bg-neutral-800">
        {children}
      </code>
    ),
  },
};
