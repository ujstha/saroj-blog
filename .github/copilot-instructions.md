# AI Coding Agent Instructions for Saroj's Blog

## Architecture Overview

This is a **Next.js 14 headless CMS blog** with Sanity.io for content management, Stripe for donations, and EmailJS for contact forms. Key architectural decisions:

- **Pages**: Home (`page.js`), Blog listing (`blogs/page.js`), Dynamic blog posts (`blogs/[slug]/page.js`), Donation (`buy-me-a-coffee/page.js`), Thank you (`thank-you/page.js`)
- **Data Source**: All blog content and categories from Sanity.io via `sanityFetch()` with revalidation
- **Styling**: Tailwind CSS with custom color system using CSS variables (`--background-color-rgb`, `--primary-text-color-rgb`, etc.)
- **Analytics**: Google Tag Manager, Google Analytics 4, Vercel Analytics, and Speed Insights integrated via `layout.js`
- **Payments**: Stripe checkout integration in `/api/checkout-session` for "buy me a coffee" feature

## Critical Files & Patterns

### Sanity Integration
- **Location**: `src/utils/sanity.js` — contains `client` singleton and `sanityFetch()` wrapper
- **Key Pattern**: `sanityFetch({ query, params, tags })` uses Next.js revalidation for ISR (30s in all environments)
- **Image URLs**: Use `urlFor()` to build CDN URLs from Sanity image assets
- **Queries**: Defined in `src/constants/sanity-queries.js` — always include `'slug': slug.current` transformation for dynamic routes
- **Example**: `BLOG_QUERY` filters by slug and includes related categories via `categories[]->title` join

### Component Structure
- **UI Components** (`src/components/ui/`): Reusable primitives (Button, CustomImage, Icon, Logo, Navbar, Footer, Section, Container, Skeleton, ThemeToggle)
- **Section Components** (`src/components/section/`): Page-level composites (BlogSection, HeroSection, SubscribeSection, HighlightedSection)
- **Server Components**: BlogSection and HighlightedSection are async `export const` components that fetch directly from Sanity
- **Client-side**: ThemeProvider wraps app with `next-themes`; use `"use client"` directive at top of interactive components

### Styling Conventions
- **Tailwind Merge**: Always use `cn()` utility from `src/utils/cn.js` to merge Tailwind classes (prevents conflicts)
- **Dynamic Colors**: Theme colors use Tailwind custom colors from config: `background`, `primary`, `secondary`, `tertiary`, `accent1`
- **Alpha Variants**: Custom Tailwind plugin generates `.bg-secondary-10`, `.text-primary-25` for opacity levels (5% to 95%)
- **Font Classes**: `headingFont.className` and `bodyFont.className` from `src/app/fonts.js`

### Stripe Integration
- **Endpoint**: `src/app/api/checkout-session/route.js` accepts POST with `{ amount }` in cents (multiplied by 100)
- **Requires**: `.env` variables `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_BASE_URL`
- **Currency**: EUR hardcoded; adjust if needed
- **Success/Cancel**: Redirects to `/thank-you` with session ID or home

## Development Workflow

### Setup
```bash
npm install
cp .env.example .env.local  # Add Sanity, EmailJS, GTM, GA, Stripe credentials
npm run dev  # Starts on localhost:3000
```

### Build & Deployment
- **Build**: `npm run build` — Next.js ISR with Sanity revalidation tags
- **Lint**: `npm run lint` with ESLint (includes `eslint-plugin-tailwindcss`)
- **Format**: Prettier with Tailwind class sorting (`prettier-plugin-tailwindcss`)
- **Git Hooks**: Husky pre-commit (configured in `package.json` scripts)

### Key Environment Variables
```env
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
NEXT_PUBLIC_EMAILJS_SERVICE_ID
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
NEXT_PUBLIC_RECIPIENT_NAME
NEXT_PUBLIC_RECIPIENT_EMAIL
NEXT_PUBLIC_GTM_ID
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
STRIPE_SECRET_KEY
NEXT_PUBLIC_BASE_URL
```

## Common Task Patterns

### Add a New Blog Page Section
1. Create async component in `src/components/section/`
2. Import Sanity query from `src/constants/sanity-queries.js`
3. Fetch data: `const data = await sanityFetch({ query: YOUR_QUERY })`
4. Import UI components (Container, Section) and compose
5. Export component in `src/components/section/index.js`

### Update Tailwind Colors
- Theme colors live in `tailwind.config.js` extending CSS variables
- To add new color: define CSS var in `globals.css`, add to Tailwind `colors` object, use in classes
- Use `cn()` to merge conflicting classes

### Modify Blog Queries
- All GROQ queries in `src/constants/sanity-queries.js`
- Always include transformations (`'slug': slug.current`)
- Use `$variables` for dynamic params (e.g., `$slug`, `$category`)
- Pagination/filtering happens in query, not in-component

### Handle Images
- Always wrap Sanity images with `CustomImage` component
- Convert src via `urlFor(sanityImageAsset)` before passing
- Specify className with height/width overrides if needed

## External Dependencies
- **next-sanity**: GROQ queries and content delivery
- **stripe**: Payment processing (server-side only)
- **emailjs**: Contact form emails (frontend)
- **react-toastify**: Toast notifications
- **react-ga4 / react-gtm-module**: Analytics
- **@vercel/analytics**: Vercel Web Analytics
- **lottie-react**: Animations
- **class-variance-authority + clsx + tailwind-merge**: CSS class merging

## Avoid/Know
- Do **not** fetch Sanity queries in client components — use server components or API routes
- Do **not** hardcode colors — use Tailwind theme variables
- Do **not** add `<img>` tags — use `CustomImage` component
- Next.js ISR revalidation is set to 30s (all environments) — on-demand revalidation not configured
- Stripe amounts must be in cents (multiply by 100)
