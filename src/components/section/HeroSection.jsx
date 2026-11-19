import { headingFont } from "@/app/fonts";
import { T } from "@/components/T";
import { Container, CustomImage, Section } from "../ui";

export const HeroSection = () => {
  return (
    <Section className="relative overflow-hidden pt-4 md:pt-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(var(--accent-color-1-rgb),0.15),transparent_60%)]" />
      <div className="absolute inset-y-0 left-0 hidden w-1/3 bg-fixed bg-blend-multiply !bg-accent1-80 md:block" />
      <div className="absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-l from-[rgba(var(--background-color-rgb),1)] backdrop-blur-3xl md:block" />
      <Container className="relative flex flex-col items-center justify-evenly gap-12 sm:flex-row">
        <div className="animate-fade-up">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="border-accent1/20 bg-background/70 relative inline-block min-w-72 rounded-[32px] border p-4 shadow-[0_26px_60px_rgba(10,18,28,0.1)] backdrop-blur-md">
              <div className="animate-glow-pulse absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(var(--accent-color-1-rgb),0.14),transparent_48%)]" />
              <CustomImage
                src="/assets/saroj-bartaula.webp"
                alt="Saroj Bartaula"
                priority
                className="relative z-20 !h-72 !w-72 rounded-[26px] bg-secondary object-cover"
              />
              <div className="animate-float-slow bg-accent1/20 absolute -left-5 top-1/3 h-32 w-40 -rotate-45 rounded-full blur-2xl" />
              <div className="bg-background/80 absolute right-12 top-3 size-8 rounded-full border border-white/60" />
              <div className="absolute bottom-6 right-14 size-4 rounded-full bg-accent1 shadow-[0_0_18px_rgba(var(--accent-color-1-rgb),0.65)]" />
            </div>
            <div className="border-primary/10 bg-background/90 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.08em] text-secondary shadow-[0_10px_24px_rgba(10,18,28,0.08)] md:text-[11px] md:tracking-[0.14em]">
              Software &amp; AI Engineer · Founder · Filmmaker
            </div>
          </div>
        </div>
        <div className="animate-fade-up animation-delay-150 -mt-2 max-w-xl md:-mt-4">
          <p className="mb-3 text-[11px] uppercase tracking-[0.34em] text-secondary md:text-xs">
            Personal Blog and Creative Archive
          </p>
          <h1
            className={`flex flex-col font-extrabold tracking-wide ${headingFont.className}`}
          >
            <T
              k="hero.greeting"
              fallback="Hi."
              as="span"
              className="font-outline-2 text-5xl text-transparent md:text-7xl"
            />
            <span className="mt-1 text-3xl leading-tight md:text-5xl">
              <T k="hero.name" fallback="I'm Saroj" />{" "}
              <span className="text-accent1">Bartaula</span>
            </span>
          </h1>
          <T
            k="hero.tagline"
            fallback="Ideas in Motion"
            as="p"
            className="mt-4 max-w-md text-base font-medium uppercase tracking-[0.24em] text-secondary xl:text-lg"
          />
          <T
            k="hero.description"
            fallback="Hi, I'm Saroj. I live in the Milky Way galaxy and currently work across software, AI, computer vision and human motion. I founded Tenslam Vision to explore motion technology, simulation and Physical AI. Filmmaking is part of my earlier creative background, and this remains the place where I share technology, stories, science and personal ideas."
            as="p"
            className="mt-5 max-w-lg text-balance text-sm leading-7 text-secondary xl:text-base"
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="border-primary/10 bg-background/90 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
              Technology
            </span>
            <span className="border-primary/10 bg-background/90 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
              Storytelling
            </span>
            <span className="border-primary/10 bg-background/90 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
              Science
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
};
