// eslint-disable-next-line camelcase
import { Manrope, Noto_Sans_Devanagari, Space_Grotesk } from "next/font/google";

export const bodyFont = Manrope({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-body",
});

export const headingFont = Space_Grotesk({
  weight: ["500", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-heading",
});

export const nepaliFont = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-nepali",
});
