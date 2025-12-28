"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CustomImage } from "./CustomImage";

export const Logo = ({ asLink = true, className = "!w-20 bg-transparent md:!w-28" }) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted)
    return <div className="animate-pulse rounded px-10 py-8 bg-accent1-10" />;

  const logoImage = (
    <CustomImage
      src={
        resolvedTheme === "dark"
          ? "/assets/saroj-bartaula-logo-white.png"
          : "/assets/saroj-bartaula-logo.png"
      }
      alt="Saroj Bartaula Blog logo"
      className={className}
    />
  );

  if (asLink) {
    return <Link href="/">{logoImage}</Link>;
  }

  return logoImage;
};
