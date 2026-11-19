import { Children, cloneElement, isValidElement } from "react";

export const formatDate = (dateString) => {
  if (!dateString) return null;

  const date = new Date(dateString);
  const options = { day: "numeric", month: "short", year: "numeric" };

  return date.toLocaleDateString("en-US", options);
};

/**
 * Remove unnecessary em dashes (—) from text to make it sound more natural.
 * Replaces "word — word" and "word—word" with "word, word".
 * Preserves em dashes at the start of lines (dialogue) and numeric ranges.
 */
export const cleanEmDashes = (text) => {
  if (typeof text !== "string") return text;
  return (
    text
      // " — " or "— " at mid-sentence → comma
      .replace(/(?<=\w)\s*—\s*(?=\w)/g, ", ")
      // lone em dash left over (e.g. at end of phrase) → remove
      .replace(/\s*—\s*/g, " ")
      // tidy double commas that may result
      .replace(/,\s*,/g, ",")
  );
};

/**
 * Recursively walk React children and clean em dashes in every string node.
 * Safe for PortableText output — it preserves element types, keys and props.
 */
export const cleanTextChildren = (children) => {
  return Children.map(children, (child) => {
    if (typeof child === "string") {
      return cleanEmDashes(child);
    }
    if (isValidElement(child) && child.props?.children != null) {
      return cloneElement(child, {
        ...child.props,
        children: cleanTextChildren(child.props.children),
      });
    }
    return child;
  });
};
