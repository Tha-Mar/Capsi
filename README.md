# Capsy

A catalog site for handmade scrub caps. Customers browse fabric designs and tap a card to text an order — no cart, no checkout.

## Overview

Capsy is a single-product-line catalog built with Next.js. The public homepage showcases a scroll-driven hero, an "about" story, and a filterable design library where each card is an SMS deep link that prefills an order text. An auth-gated admin panel (Supabase-backed) lets the owner manage designs, upload images, and reorder the catalog inline.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Key Features](#key-features)
- [Environment Variables](#environment-variables)
- [Notes](#notes)

## Tech Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| Framework    | Next.js 16 (App Router, Turbopack), React 19    |
| Language     | TypeScript                                      |
| Styling      | Tailwind CSS v4, shadcn/ui, Radix UI            |
| Theming      | next-themes                                     |
| Backend/Auth | Supabase (`@supabase/ssr`), Postgres + Storage  |
| Icons        | lucide-react                                    |
| Deploy       | Vercel                                          |

## Architecture

The public site and the admin panel share **one source of truth: Supabase**. The homepage reads designs and editable copy from Supabase via a read-only anonymous client, falling back to a bundled local catalog (`lib/local-design-catalog.ts` + `public/designs/*`) whenever Supabase is unconfigured or empty, so the site is never blank. The admin panel reads/writes the same Supabase tables; edits show up on the public site after revalidation.

```mermaid
flowchart TD
    Visitor([Visitor]) --> Home["/ (app/page.tsx)"]
    Owner([Owner]) --> Login["/admin/login"]

    subgraph Public["Public site"]
        Home --> Hero[SiteHero]
        Home --> About[AboutCapsi]
        Home --> Library[DesignLibrary]
        Library -->|sms: deep link| Phone([Order via text])
    end

    subgraph Admin["Admin panel (auth-gated, inline editing)"]
        Login --> AdminPage["/admin"]
        AdminPage --> AdminHero["SiteHero / AboutCapsi (adminMode)"]
        AdminPage --> Manager[AdminCatalogManager]
        AdminHero --> Actions[Server Actions]
        Manager --> Actions
    end

    subgraph Supabase["Supabase (source of truth)"]
        DB[("designs + categories<br/>+ site_content")]
        Storage[("design-images bucket")]
    end

    Local[("Local fallback catalog<br/>lib/local-design-catalog.ts")]

    Home -->|"getCatalogDesigns / getSiteContent (anon read)"| DB
    Home -.->|fallback when empty/unconfigured| Local
    AdminPage -->|getAdminDesigns| DB
    Actions -->|create / update / delete / reorder / import / edit copy| DB
    Actions -->|image upload| Storage
    Proxy[proxy.ts] -->|refresh session| DB
```

## Project Structure

```
.
├── app/
│   ├── page.tsx              # Public homepage (hero + about + library)
│   ├── layout.tsx            # Root layout, fonts, ThemeProvider
│   ├── globals.css           # Tailwind + custom animations
│   └── admin/
│       ├── page.tsx          # Auth-gated inline catalog editor
│       ├── login/page.tsx    # Admin sign-in
│       └── actions.ts        # Server actions (auth, CRUD, import, edit copy)
├── components/
│   ├── site-hero.tsx         # Scroll-driven hero; inline-editable in admin
│   ├── about-capsi.tsx       # About section; inline-editable in admin
│   ├── design-library.tsx    # Category filter + SMS-to-order cards (public)
│   ├── admin-catalog-manager.tsx  # Admin card grid (edit/delete/reorder)
│   ├── editable-text.tsx     # Hover-to-edit text field for admin mode
│   ├── theme-provider.tsx
│   └── ui/button.tsx         # shadcn/ui
├── lib/
│   ├── designs.ts            # Catalog data (Supabase read + local fallback)
│   ├── site-content.ts       # Editable hero/About copy + defaults
│   ├── design-shared.ts      # CatalogDesign type, default categories
│   ├── local-design-catalog.ts  # Bundled fallback catalog from /public/designs
│   └── supabase/             # anon (public read), client, server, proxy, env
├── supabase/
│   └── schema.sql            # Tables, RLS policies, storage bucket, seeds
├── public/designs/           # Local catalog images (8 categories)
└── proxy.ts                  # Next 16 proxy: Supabase session refresh
```

## Getting Started

```bash
# Install dependencies
npm install

# Configure environment (see below)
cp .env.example .env.local

# Run the dev server
npm run dev
```

The public site runs without any configuration (it uses the local catalog). The admin panel at `/admin` requires Supabase — apply `supabase/schema.sql` to your Supabase project and create an auth user to sign in.

### Scripts

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start dev server (Turbopack)   |
| `npm run build`     | Production build               |
| `npm run start`     | Serve production build         |
| `npm run lint`      | Run ESLint                     |
| `npm run format`    | Format with Prettier           |
| `npm run typecheck` | Type-check with `tsc --noEmit` |

## Key Features

- Scroll-driven hero with sequential image swapping
- Filterable design library by category
- Order-by-text: each design card opens an SMS draft prefilled with the design name
- Auth-gated admin that edits the live site in place: inline-editable hero/About copy, plus add / edit / delete / reorder / image-upload for designs
- One source of truth (Supabase) with a bundled local fallback so the site is never empty
- Supabase Row Level Security: public read, authenticated write

## Admin Setup

First-time setup for the editing panel (one-time, requires the Supabase project):

1. Run `supabase/schema.sql` in the Supabase SQL editor (idempotent — safe to re-run; it also migrates an existing project).
2. Create the owner's user in Supabase Auth, and in Authentication settings **disable public email signups** so only that account can edit (RLS grants write access to any authenticated user).
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the deployment environment.
4. Sign in at `/admin` and click **Import existing catalog** once to copy the bundled designs into the database.

## Environment Variables

| Variable                               | Required for | Description                   |
| -------------------------------------- | ------------ | ----------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Admin        | Supabase project URL          |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Admin        | Supabase publishable/anon key |

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is accepted as a fallback for the publishable key.

## Notes

- The public site reads from Supabase with a graceful fallback to the bundled local catalog, so it renders even before the database is seeded or if Supabase is unconfigured.
- Editable hero/About copy lives in the `site_content` table; clearing a field reverts it to the built-in default.
- The `designs` table retains `material`, `fit`, and `availability` columns from an earlier richer product model (now nullable and unused by the admin UI).
