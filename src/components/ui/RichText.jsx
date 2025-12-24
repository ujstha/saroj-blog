import { urlFor } from "@/utils/sanity";
import Link from "next/link";
import { CustomImage, Icon } from ".";

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
            <p className="mt-2 text-center text-sm text-secondary italic">
              {value.caption}
            </p>
          )}
        </div>
      );
    },
    code: ({ value }) => (
      <pre className="my-6 rounded-lg bg-neutral-900 p-4 text-sm text-white overflow-x-auto">
        <code>{value.code}</code>
      </pre>
    ),
  },

  block: {
    h1: ({ children }) => (
      <h1 className="mb-4 mt-8 text-2xl font-bold leading-tight md:text-3xl">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-3 mt-8 text-xl font-semibold leading-tight md:text-2xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-6 text-lg font-semibold leading-tight md:text-xl">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-2 mt-6 text-base font-semibold leading-tight md:text-lg">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="mb-2 mt-4 text-base font-medium leading-tight">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="mb-2 mt-4 text-sm font-medium uppercase leading-tight tracking-wide">
        {children}
      </h6>
    ),
    blockquote: ({ children }) => (
      <blockquote className="relative mx-auto my-8 max-w-sm rounded-lg border px-8 py-4 text-center italic border-accent1-40">
        <span className="absolute -top-3 left-2 bg-background p-0.5 text-accent1">
          <Icon icon="quote" />
        </span>
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="mb-4 text-sm leading-7 text-secondary lg:text-base">
        {children}
      </p>
    ),
  },

  list: {
    bullet: ({ children }) => (
      <ul className="mb-6 ml-6 list-disc space-y-2 text-sm lg:text-base">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-6 ml-6 list-decimal space-y-2 text-sm lg:text-base">
        {children}
      </ol>
    ),
  },

  listItem: {
    bullet: ({ children }) => (
      <li className="leading-7 text-secondary">{children}</li>
    ),
    number: ({ children }) => (
      <li className="leading-7 text-secondary">{children}</li>
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
      <code className="rounded bg-neutral-200 px-1.5 py-0.5 text-sm font-mono dark:bg-neutral-800">
        {children}
      </code>
    ),
  },
};
