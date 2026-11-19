import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Footer, Navbar } from "@/components/ui";
import LanguageProvider from "@/providers/LanguageProvider";
import Theme from "@/providers/ThemeProvider";
import { Analytics } from '@vercel/analytics/react'; // Vercel Analytics
import { SpeedInsights } from '@vercel/speed-insights/next';
import dynamic from "next/dynamic";
import Script from "next/script";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { bodyFont, headingFont, nepaliFont } from "./fonts";
import "./globals.css";

// Lazy-load heavy client widgets — not needed for initial paint
const LazyChatWidget = dynamic(
  () => import("@/components/chat/ChatWidget").then((mod) => ({ default: mod.ChatWidget })),
  { ssr: false }
);

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
const SITE_URL = "https://sarojbartaula.com";
const SITE_DESCRIPTION =
  "Saroj Bartaula is a software and AI engineer, founder of Tenslam Vision and independent filmmaker based in Barcelona, working across computer vision, human motion, simulation and Physical AI.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Saroj Bartaula",
    default: "Saroj Bartaula | AI & Software Engineer, Founder of Tenslam Vision",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    type: "website",
    siteName: "Saroj Bartaula",
    title: "Saroj Bartaula | AI & Software Engineer, Founder of Tenslam Vision",
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/`,
    images: [
      {
        url: "/assets/saroj-bartaula.webp",
        width: 500,
        height: 500,
        alt: "Saroj Bartaula",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saroj Bartaula | AI & Software Engineer, Founder of Tenslam Vision",
    description: SITE_DESCRIPTION,
    images: ["/assets/saroj-bartaula.webp"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
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

        {/* Google Analytics via GTM */}
        {GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={`${bodyFont.variable} ${bodyFont.className} ${headingFont.variable} ${nepaliFont.variable} antialiased`}>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `
              <iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>
            `,
          }}
        />
        <ToastContainer />
        <ErrorBoundary>
          <LanguageProvider>
            <Theme>
              <Navbar />
              <main>{children}</main>
              <SpeedInsights />
              <Analytics /> {/* Vercel Analytics */}
              <Footer />
              <LazyChatWidget />
            </Theme>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
