# Copilot Instructions for CleanSwipe Laundry App

## Project Overview
- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL (default port 55432)
- **ORM:** Prisma (schema: `prisma/schema.prisma`, client: `lib/generated/prisma/client`)
- **API:** Next.js Route Handlers under `app/api/*` (uses Prisma client via `lib/prisma.ts`)
- **Frontend:** Main mount in `app/components/AppClient.tsx` and `app/page.tsx`
- **Auth:** NextAuth.js (see `app/api/auth/[...nextauth]/route.ts`)
- **Push Notifications:** Service worker (`public/sw.js`), server push via VAPID keys, subscriptions stored in JSON or (planned) Prisma

## Key Developer Workflows
- **Local DB:** Start Postgres on port 55432 (see README for Docker command)
- **Env Setup:** Set `DATABASE_URL` and VAPID keys in environment before running
- **Install:** `npm install`
- **Prisma:**
  - Generate: `npx prisma generate --config prisma.config.ts`
  - Migrate: `npx prisma migrate dev --name init`
  - Studio: `npx prisma studio`
- **Build:** `npm run build`
- **Dev:** `npm run dev`
- **Seed:** `npm run seed` (uses `prisma/seed.js`, imports PrismaClient from `lib/generated/prisma/client`)
- **Docker:** Multi-stage build in `Dockerfile`, runtime expects env vars

## Project-Specific Patterns
- **API Protection:** `middleware.ts` restricts `/api/*` routes to requests from app origin or with `x-internal-secret` header
- **Prisma Client Path:** Generated to `lib/generated/prisma/client` (not default)
- **Local Identity:** Demo uses localStorage for lightweight user identity
- **Push Subscriptions:** Initially stored in JSON, planned migration to Prisma model per user
- **Service Worker:** Registered in client components for push notifications
- **UI:** Uses Tailwind CSS utility classes, custom components in `app/components/`

## Integration Points
- **NextAuth:** Auth routes in `app/api/auth/[...nextauth]/route.ts`
- **Prisma:** All DB access via Prisma client, see `lib/prisma.ts` and API routes
- **Push API:**
  - VAPID keys required in env
  - Subscriptions POSTed to `/api/push/subscribe`
  - Pushes sent via `/api/push/send` (uses `web-push`)
- **Environment Variables:**
  - `DATABASE_URL`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_INTERNAL_API_SECRET`

## Examples
- **Prisma Client Import (custom path):**
  ```js
  import { PrismaClient } from "../lib/generated/prisma/client";
  ```
- **API Route Handler:**
  ```ts
  // app/api/orders/route.ts
  import prisma from "@/app/components/lib";
  export async function POST(req) { /* ... */ }
  ```
- **Service Worker Registration:**
  ```js
  navigator.serviceWorker.register('/sw.js')
  ```

## Conventions
- Use relative imports for Prisma client in scripts
- Protect API routes with middleware and/or NextAuth
- Store push subscriptions per user (planned: in DB)
- Use Tailwind for UI layout and styling

---

_If any section is unclear or missing key project knowledge, please provide feedback so this guide can be improved._
