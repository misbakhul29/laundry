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
