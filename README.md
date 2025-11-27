# CleanSwipe - Laundry Demo (Next.js + Prisma + Postgres)

This project is a demo laundry app adapted to use a local PostgreSQL database via Prisma (no Firebase).

Key points:
- Database: PostgreSQL on localhost port `55432` (you can change the URL via `DATABASE_URL`).
- ORM: Prisma. Schema is in `prisma/schema.prisma`.
- API: Next.js Route Handlers under `app/api/*` using the Prisma client in `lib/prisma.ts`.
- Frontend: Client component mount at `app/components/AppClient.tsx` and `app/page.tsx` loads it.

Getting started (local development):

1. Start a Postgres instance listening on port 55432. Example (Docker):

```powershell
docker run --name laundry-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=laundrydb -p 55432:5432 -d postgres:15
```

2. Set `DATABASE_URL` in your environment (PowerShell example):

```powershell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:55432/laundrydb"
```

3. Install dependencies:

```powershell
# from project root
npm install
```

4. Generate Prisma client and run migrations:

```powershell
npx prisma generate
npx prisma migrate dev --name init
# optionally open Studio
npx prisma studio
```

5. Run the app:

```powershell
npm run dev
```

Notes and next steps:
- The frontend uses a lightweight local identity (stored in `localStorage`) for demo purposes.
- The API endpoints are under `/api/shops` and `/api/orders`.
- For production you should add proper auth, validation, and tests.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Restricting API access to this app

This repository includes a `middleware.ts` that protects routes under `/api/*` so that requests are allowed only when one of the following is true:

- The request `Origin` or `Referer` header matches the app origin (value set in `NEXT_PUBLIC_APP_URL`), or
- The request contains the internal header `x-internal-secret` with a value equal to `NEXT_INTERNAL_API_SECRET` (server-to-server calls).

This approach lets your Next.js frontend (browser) call APIs normally when served from the same origin, and also lets server-side code (server components / API routes) call the API by attaching a secret header that is never exposed to the browser.

Environment variables to configure:

- `NEXT_PUBLIC_APP_URL` — the public URL of your app (example: `https://example.com` or `http://localhost:3000` for dev). This is used to allow browser-originated requests.
- `NEXT_INTERNAL_API_SECRET` — a server-only secret used by server-side fetches to identify internal requests. DO NOT prefix this with `NEXT_PUBLIC_` and DO NOT commit it.

Server-side fetch example (use only from server code; e.g., in an API route or server component):

```powershell
# PowerShell example, environment variable is available on the server
$env:NEXT_INTERNAL_API_SECRET = "your-secret-here"

# Node / server-side fetch example (inside a server component or API route)
await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/orders`, {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'x-internal-secret': process.env.NEXT_INTERNAL_API_SECRET,
	},
	body: JSON.stringify({ /* payload */ }),
})
```

Notes and caveats:

- This middleware is a defense-in-depth mechanism. Determined attackers can spoof headers; for strong security you should still require proper authentication (sessions, JWTs) and server-side authorization checks inside your API handlers.
- The `NEXT_INTERNAL_API_SECRET` mechanism is intended for server-to-server calls originating from your Next.js server (server components or API routes). Never expose that secret in client-side code.

