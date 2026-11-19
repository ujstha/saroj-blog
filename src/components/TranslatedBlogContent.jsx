"use client";

/* eslint-disable tailwindcss/classnames-order */

import { ListenButton } from "@/components/ui/ListenButton";
import { useLanguage } from "@/providers/LanguageProvider";
import { cleanEmDashes } from "@/utils/helpers";
import { portableTextToBlocks } from "@/utils/portableTextToPlainText";
import { PortableText } from "@portabletext/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { RichText } from "./ui/RichText";

const SEPARATOR = " ||| ";

/**
 * Client wrapper for blog content that handles translation + listen button.
 * When language is "en", renders Portable Text normally via PortableText.
 * When language changes, combines all text into ONE API request (avoids 429),
 * then renders the translated version preserving paragraph spacing.
 * The ListenButton is integrated here so it can receive translated text for audio.
 * Caches translations in localStorage.
 */
export const TranslatedBlogContent = ({ content, slug, title: originalTitle, showListenButton = false }) => {
  const { language, mounted } = useLanguage();
  const [translatedBlocks, setTranslatedBlocks] = useState(null);
  const [translatedPlainText, setTranslatedPlainText] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const getCacheKey = useCallback(
    (type) => `translation_${slug}_${language}_${type}`,
    [slug, language]
  );

  useEffect(() => {
    // Cancel any in-flight request from a previous language/slug change
    abortRef.current?.abort();

    if (!mounted || language === "en") {
      setTranslatedBlocks(null);
      setTranslatedPlainText(null);
      setError(null);
      return;
    }

    // Check cache first
    const cachedContent = localStorage.getItem(getCacheKey("content"));
    const cachedPlainText = localStorage.getItem(getCacheKey("plaintext"));

    if (cachedContent) {
      try {
        setTranslatedBlocks(JSON.parse(cachedContent));
        if (cachedPlainText) setTranslatedPlainText(cachedPlainText);
        return;
      } catch {
        // Cache corrupted, re-translate
      }
    }

    const controller = new AbortController();
    abortRef.current = controller;
    translateContent(controller.signal);

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, mounted, slug]);

  const translateContent = async (signal) => {
    setIsTranslating(true);
    setError(null);

    try {
      const textBlocks = portableTextToBlocks(content);

      const blocksToTranslate = textBlocks.filter((block) => block.text.trim().length > 0);

      // Combine title + all non-empty blocks into ONE string separated by |||
      const allTexts = [originalTitle, ...blocksToTranslate.map((b) => b.text)];
      const combinedText = allTexts.join(SEPARATOR);

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: combinedText,
          sourceLang: "en",
          targetLang: language,
        }),
        signal,
      });

      const data = await res.json();

      if (signal?.aborted) return;

      if (!res.ok || !data.translatedText) {
        throw new Error(data.error || "Translation failed");
      }

      // Split translated text back into parts (first part is title, rest are blocks)
      const translatedParts = data.translatedText.split(SEPARATOR);
      let translateIndex = 0;

      const translated = textBlocks.map((block) => {
        if (block.text.trim().length === 0) {
          return {
            ...block,
            translatedText: block.text,
          };
        }

        const translatedText = translatedParts[++translateIndex];
        return {
          ...block,
          translatedText: cleanEmDashes(
            translatedText !== undefined ? translatedText : block.text
          ),
        };
      });

      setTranslatedBlocks(translated);

      // Build plain text for audio playback
      const plainText = translated
        .map((b) => b.translatedText)
        .filter((t) => t.trim())
        .join(". ");
      setTranslatedPlainText(cleanEmDashes(plainText));

      // Cache
      localStorage.setItem(getCacheKey("content"), JSON.stringify(translated));
      localStorage.setItem(getCacheKey("plaintext"), plainText);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Translation failed:", err);
      setError("Translation unavailable. Showing original content.");
    } finally {
      if (!signal?.aborted) {
        setIsTranslating(false);
      }
    }
  };

  // English or initial state: render original Portable Text with full RichText formatting
  if (language === "en" || (!translatedBlocks && !isTranslating)) {
    return (
      <>
        {showListenButton && <ListenButton content={content} />}
        <article className="space-y-0">
          <PortableText value={content} components={RichText} />
        </article>
      </>
    );
  }

  // Loading state: show spinner + faded original
  if (isTranslating) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg border border-accent1-20 bg-accent1-5 px-4 py-3 text-sm">
          <LoadingSpinner />
          <span className="text-secondary">
            {language === "es" ? "Traduciendo..." : "अनुवाद गर्दै..."}
          </span>
        </div>
        {showListenButton && <ListenButton content={content} />}
        <article className="space-y-0 opacity-50">
          <PortableText value={content} components={RichText} />
        </article>
      </div>
    );
  }

  // Error state: show warning + original content
  if (error) {
    return (
      <>
        <div className="mb-4 rounded-lg border border-secondary-20 bg-secondary-5 px-4 py-2 text-sm text-secondary">
          {error}
        </div>
        {showListenButton && <ListenButton content={content} />}
        <article className="space-y-0">
          <PortableText value={content} components={RichText} />
        </article>
      </>
    );
  }

  // Render translated content with listen button that speaks translated text
  return (
    <>
      {showListenButton && (
        <ListenButton content={content} translatedText={translatedPlainText} />
      )}
      <article>
        {translatedBlocks.map((block, index) => {
          const hasContent = block.translatedText?.trim().length > 0;
          // Skip empty blocks entirely to avoid stacking blank paragraph gaps.
          if (!hasContent) return null;
          const BlockTag = getBlockTag(block.style);
          const blockClass = getBlockClass(block.style);
          return (
            <BlockTag key={block.key || index} className={blockClass}>
              {block.translatedText}
            </BlockTag>
          );
        })}
      </article>
      <div className="mt-6 text-xs text-secondary-50">
        {language === "es"
          ? "Traducido automáticamente. El contenido original está en inglés."
          : "स्वचालित रूपमा अनुवाद गरिएको। मूल सामग्री अंग्रेजीमा छ।"}
      </div>
    </>
  );
};

function getBlockTag(style) {
  switch (style) {
    case "h1": return "h1";
    case "h2": return "h2";
    case "h3": return "h3";
    case "h4": return "h4";
    case "h5": return "h5";
    case "h6": return "h6";
    case "blockquote": return "blockquote";
    default: return "p";
  }
}

function getBlockClass(style) {
  // These classes match the original RichText component exactly
  switch (style) {
    case "h1":
      return "mb-5 mt-10 text-balance text-2xl font-bold leading-tight text-primary md:text-3xl";
    case "h2":
      return "mb-4 mt-10 text-balance text-xl font-bold leading-tight text-primary md:text-2xl";
    case "h3":
      return "mb-3 mt-8 text-balance text-lg font-semibold leading-snug text-primary md:text-xl";
    case "h4":
      return "mb-3 mt-6 text-base font-semibold leading-snug text-primary md:text-lg";
    case "h5":
      return "mb-2 mt-5 text-base font-medium leading-snug text-primary";
    case "h6":
      return "mb-2 mt-5 text-sm font-medium uppercase leading-snug tracking-wide text-primary";
    case "blockquote":
      return "relative mx-auto my-8 max-w-xl rounded-lg border border-accent1-40 px-8 py-5 text-center text-lg italic leading-relaxed whitespace-pre-wrap";
    default:
      return "mb-5 whitespace-pre-wrap text-base leading-8 tracking-normal text-secondary md:mb-6 md:text-lg md:leading-8";
  }
}

function LoadingSpinner() {
  return (
    <svg
      className="size-4 animate-spin text-accent1"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
