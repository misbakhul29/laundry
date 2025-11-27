import type { NextConfig } from "next";
import dotenv from 'dotenv';

// Load .env into process.env for local development / build time.
// In production, prefer providing env vars via your deployment (pm2, systemd,
// container secrets, or your platform's secret manager).
dotenv.config();

const nextConfig: NextConfig = {
  /* config options here */

  // NOTE: `env` values here are inlined at build time and will be available
  // on both client and server. Do NOT put production secrets here if you
  // don't want them bundled into the client. For server-only secrets (like
  // NEXT_AUTH_SECRET) prefer to inject them at runtime via your process env
  // (pm2 ecosystem, systemd, container secrets, Vercel/Netlify env, etc.).
  env: {
    // safe public values (example)
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,

    // If you really need to expose a server secret at build time (NOT
    // recommended), you can include it here. Prefer runtime injection.
    // This line tries common names but will inline the value at build time.
    NEXT_AUTH_SECRET:
      process.env.NEXT_AUTH_SECRET || process.env.NEXT_AUTH_SECRET || process.env.NEXT_INTERNAL_API_SECRET,
  },
};

export default nextConfig;
