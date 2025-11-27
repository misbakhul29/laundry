import NextAuth, { User, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

// strongly type the session to avoid `any`
export interface ExtendedSession extends Session {
  accessToken?: string;
  refreshToken?: string;
  user: User;
}
// Derive a single secret value from multiple possible env var names so the
// app works regardless of whether the deploy sets `NEXTAUTH_SECRET` or
// `NEXT_AUTH_SECRET` (or in some setups an internal secret is used).
const NEXT_AUTH_SECRET =
  process.env.NEXTAUTH_SECRET || process.env.NEXT_AUTH_SECRET || process.env.NEXT_INTERNAL_API_SECRET || '';

if (!NEXT_AUTH_SECRET) {
  // In production NextAuth will throw if no secret exists; log here for easier debugging.
  console.warn('[next-auth] No NEXTAUTH_SECRET / NEXT_AUTH_SECRET / NEXT_INTERNAL_API_SECRET found in env');
}

const handler = NextAuth({
  secret: NEXT_AUTH_SECRET || undefined,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    // --- Google Login ---
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // --- Credentials Login (email + password) ---
    Credentials({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.username,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // console.log("JWT Callback", { user: !!user, token: !!token });
      if (user) {
        token.user = user;

        const secret = NEXTAUTH_SECRET;
        if (!secret) {
          console.error('NEXTAUTH_SECRET (or fallback) is not defined');
          return token;
        }

        const payload = {
          email: user.email,
          userId: user.id,
          ssoToken: account?.access_token
        };

        try {
          const accessToken = jwt.sign(payload, secret, { expiresIn: '30d' });
          const refreshToken = jwt.sign(payload, secret, { expiresIn: '60d' });

          token.accessToken = accessToken;
          token.refreshToken = refreshToken;

          let userAgent = "Unknown";
          let ip = "Unknown";

          try {
            const headersList = await headers();
            userAgent = headersList.get("user-agent") || "Unknown";
            ip = headersList.get("x-forwarded-for")?.split(',')[0] || "Unknown";
          } catch (headerError) {
            console.error("Error fetching headers:", headerError);
          }

          console.log("Creating LoginSession for user:", user.id);
          await prisma.loginSession.create({
            data: {
              userId: user.id,
              accessToken: accessToken,
              refreshToken: refreshToken,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              userAgent: userAgent,
              ipAddress: ip,
              device: "Unknown"
            }
          });
          console.log("LoginSession created successfully");
        } catch (error) {
          console.error("Failed to create login session or sign token", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        try {
          const secret = NEXTAUTH_SECRET;
          if (!secret) throw new Error('NEXTAUTH_SECRET (or fallback) is not defined');

          jwt.verify(token.accessToken as string, secret);

          const dbSession = await prisma.loginSession.findFirst({
            where: { accessToken: token.accessToken as string }
          });

          console.log("Session check:", { found: !!dbSession });

          if (!dbSession || dbSession.expiresAt < new Date()) {
            throw new Error("Session expired or invalid");
          }

          const typedSession = session as ExtendedSession;
          typedSession.user = token.user as User;
          typedSession.accessToken = token.accessToken as string;
          typedSession.refreshToken = token.refreshToken as string;
        } catch (error) {
          throw error;
        }
      } else {
        throw new Error("No access token");
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
