/**
 * Extracts plain text from Sanity Portable Text blocks.
 * Skips images and code blocks — only returns readable text content.
 */
export function portableTextToPlainText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      // Skip non-text block types (images, code, etc.)
      if (block._type !== "block") return "";

      // Extract text from children spans
      if (!block.children) return "";

      return block.children
        .map((child) => {
          if (child._type === "span") return child.text || "";
          return "";
        })
        .join("");
    })
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Extracts text blocks separately (useful for chunk-based translation).
 * Returns an array of { key, text } pairs where key is the block _key.
 */
export function portableTextToBlocks(blocks) {
  if (!blocks || !Array.isArray(blocks)) return [];

  return blocks
    .filter((block) => block._type === "block" && block.children)
    .map((block) => ({
      key: block._key,
      style: block.style || "normal",
      text: block.children
        .map((child) => (child._type === "span" ? child.text || "" : ""))
        .join(""),
    }));
}
