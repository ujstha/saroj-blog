import { headingFont } from "@/app/fonts";
import { Container, CustomImage, Section } from "@/components/ui";

const SITE_URL = "https://sarojbartaula.com";
const DESCRIPTION =
  "Saroj Bartaula is a software and AI engineer, founder of Tenslam Vision and independent filmmaker based in Barcelona, working across computer vision, human motion, simulation and Physical AI.";

const profileLinks = [
  { label: "Tenslam Vision", href: "https://www.tenslamvision.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/man-on-mission/" },
  { label: "Crunchbase", href: "https://www.crunchbase.com/person/saroj-bartaula" },
  { label: "GitHub", href: "https://github.com/saroj479" },
  { label: "IMDb", href: "https://www.imdb.com/name/nm10841378/" },
];

const profileJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/about#profile-page`,
  url: `${SITE_URL}/about`,
  name: "About Saroj Bartaula",
  description: DESCRIPTION,
  mainEntity: {
    "@type": "Person",
    "@id": `${SITE_URL}/about#saroj-bartaula`,
    name: "Saroj Bartaula",
    url: `${SITE_URL}/about`,
    description: DESCRIPTION,
    image: `${SITE_URL}/assets/saroj-bartaula.webp`,
    jobTitle: "Software and AI Engineer",
    worksFor: {
      "@type": "Organization",
      name: "Tenslam Vision",
      url: "https://www.tenslamvision.com/",
    },
    sameAs: [
      "https://www.linkedin.com/in/man-on-mission/",
      "https://www.crunchbase.com/person/saroj-bartaula",
      "https://github.com/saroj479",
      "https://x.com/saroj_bartaula1",
      "https://www.imdb.com/name/nm10841378/",
    ],
    knowsAbout: [
      "Software engineering",
      "Artificial intelligence",
      "Computer vision",
      "Human motion",
      "Simulation",
      "Physical AI",
      "Filmmaking",
    ],
  },
};

export const metadata = {
  title: "About",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "profile",
    title: "Saroj Bartaula",
    description: DESCRIPTION,
    url: "/about",
    images: [{ url: "/assets/saroj-bartaula.webp", alt: "Saroj Bartaula" }],
  },
};

export default function AboutPage() {
  return (
    <Section className="relative overflow-hidden pt-8 md:pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(var(--accent-color-1-rgb),0.15),transparent_60%)]" />
      <Container className="relative">
        <div className="grid gap-10 md:grid-cols-[0.72fr_1.3fr] md:items-start lg:gap-16">
          <div className="border-primary/10 bg-background/75 rounded-[32px] border p-4 shadow-[0_26px_60px_rgba(10,18,28,0.1)] backdrop-blur-md">
            <CustomImage
              src="/assets/saroj-bartaula.webp"
              alt="Saroj Bartaula"
              priority
              className="!h-auto !w-full rounded-[26px] bg-secondary object-cover"
            />
            <p className="mt-5 px-2 text-[11px] uppercase tracking-[0.28em] text-secondary">
              Barcelona · Milky Way
            </p>
          </div>

          <article>
            <p className="text-[11px] uppercase tracking-[0.34em] text-secondary md:text-xs">
              About
            </p>
            <h1 className={`${headingFont.className} mt-3 text-4xl font-extrabold tracking-wide md:text-6xl`}>
              Saroj Bartaula
            </h1>
            <p className="mt-4 text-base font-medium leading-7 text-accent1 md:text-lg">
              Software &amp; AI Engineer · Founder of Tenslam Vision · Independent Filmmaker
            </p>

            <div className="mt-8 space-y-5 text-base leading-8 text-secondary">
              <p>
                I currently work across software engineering, artificial intelligence, computer vision and human-motion technology. My interests sit where code meets movement: how visual systems can understand motion, how simulation can support experimentation and how these ideas may contribute to Physical AI.
              </p>
              <p>
                I founded Tenslam Vision, an early-stage company exploring motion intelligence and tools for working with human movement. The work is still developing, and much of my time goes into building, testing and learning what is useful.
              </p>
              <p>
                Before this chapter, filmmaking was a central part of my creative work. I wrote and directed <em>HOME – Where We All Belong</em> and acted in <em>The Aliens Came Through the Sea</em>. Film still shapes how I think about people, observation and storytelling.
              </p>
              <p>
                This site is my personal archive. I write about technology, science, startups, filmmaking, books and ideas I am still trying to understand. It keeps the practical work and the curious, Milky Way side of my personality in the same place.
              </p>
            </div>

            <nav aria-label="Saroj Bartaula profiles" className="mt-9 flex flex-wrap gap-3">
              {profileLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-primary/10 bg-background/90 hover:border-accent1/30 rounded-full border px-4 py-2.5 text-sm font-semibold tracking-widest text-primary transition hover:-translate-y-0.5 hover:text-accent1"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </article>
        </div>
      </Container>
    </Section>
  );
}
