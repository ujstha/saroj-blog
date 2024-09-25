import { Footer, Navbar } from "@/components/ui";
import Theme from "@/providers/ThemeProvider";
import { PageView } from "@/utils/ga"; // Google Analytics page view tracking
import { Analytics } from "@vercel/analytics/react"; // Vercel Analytics
import Script from "next/script";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { bodyFont } from "./fonts";
import "./globals.css";

// Hardcoded GTM ID for testing without .env
const GTM_ID = "GTM-XXXXXXX"; // Replace with your actual GTM ID

export const metadata = {
  title: {
    template: "%s | Saroj Bartaula",
    default: "Saroj Bartaula: A personal blog",
  },
  description:
    "Welcome to my blog, a space where I share my insights on various topics including science, technology, Effective Accelerationism, machine learning, space travel, startup experiences, and personal stories. Each post offers a glimpse into my mind and my journey.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager Script */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
      </head>
      <body className={bodyFont.className}>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `
              <iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>
            `,
          }}
        />
        <ToastContainer />
        <Theme>
          <Navbar />
          <main>{children}</main>
          <Analytics />
          <PageView /> {/* Ensure this is in a client-side context */}
          <Footer />
        </Theme>
      </body>
    </html>
  );
}
