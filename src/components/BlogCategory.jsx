"use client";

export const BlogCategoryItem = ({ category, size = "sm" }) => {
  return (
    <span
      onClick={() => {
        document.location.href = `/blogs?category=${category?.toLowerCase()}`;
      }}
      title={category}
      className={`border-primary/10 bg-background/90 hover:border-accent1/25 hover:bg-accent1/10 cursor-pointer text-nowrap rounded-full border font-medium text-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:-translate-y-0.5 hover:text-primary ${size === "lg" ? "px-3.5 py-2 text-sm tracking-[0.08em]" : "px-2.5 py-1.5 text-[11px] tracking-[0.08em]"}`}
    >
      {category}
    </span>
  );
};
export const BlogCategory = ({ categories = [], size = "sm" }) => {
  if (!categories.length) return null;

  return (
    <div className="mt-2 flex flex-wrap justify-start gap-2">
      {categories?.map((category) => (
        <BlogCategoryItem key={category} category={category} size={size} />
      ))}
    </div>
  );
};
