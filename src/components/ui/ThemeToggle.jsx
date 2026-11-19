"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";

export const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="size-11 rounded-full bg-accent1-10" />;

  const handleThemeToggle = () => {
    if (resolvedTheme === "light") return setTheme("dark");
    return setTheme("light");
  };

  return (
    <button
      onClick={handleThemeToggle}
      aria-label={`Switch to ${resolvedTheme === "light" ? "Dark" : "Light"} mode`}
      title={`Switch to ${resolvedTheme === "light" ? "Dark" : "Light"} mode`}
      className="border-primary/10 bg-background/90 hover:border-accent1/25 hover:bg-accent1/10 rounded-full border p-3 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:-translate-y-0.5"
    >
      {resolvedTheme === "light" && <Icon icon="light-mode" />}
      {resolvedTheme === "dark" && <Icon icon="dark-mode" />}
    </button>
  );
};
