import NextAuth, { User, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

// --- 1. Helper Function untuk Verifikasi reCAPTCHA ---
const verifyRecaptcha = async (token: string) => {
  const secretKey = process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY || '';
  
  if (!secretKey) {
    console.warn("RECAPTCHA_SECRET_KEY is not set! Skipping verification.");
    return true; // Fallback jika env belum diset (opsional, bisa diganti return false)
  }

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      { method: "POST" }
    );
    const data = await response.json();

    // Anda bisa mengatur threshold score di sini (0.0 - 1.0)
    // 0.5 adalah standar umum. Di bawah itu dianggap bot.
    if (data.success && data.score >= 0.5) {
      return true;
    }
    
    console.error("reCAPTCHA failed:", data);
    return false;
  } catch (error) {
    console.error("reCAPTCHA connection error:", error);
    return false;
  }
};

// strongly type the session to avoid `any`
export interface ExtendedSession extends Session {
  accessToken?: string;
  refreshToken?: string;
  user: User;
}

const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET || process.env.NEXT_AUTH_SECRET || process.env.NEXT_INTERNAL_API_SECRET || '';

if (!NEXTAUTH_SECRET) {
  console.warn('[next-auth] No NEXTAUTH_SECRET / NEXT_AUTH_SECRET / NEXT_INTERNAL_API_SECRET found in env');
}

const handler = NextAuth({
  secret: NEXTAUTH_SECRET || undefined,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),

    // --- Credentials Login (email + password + recaptcha) ---
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        recaptchaToken: { label: "Recaptcha Token", type: "text" }, // Tambahkan field ini
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        // --- 2. Lakukan Verifikasi reCAPTCHA ---
        // Kita cek apakah token dikirim (frontend harus mengirimnya)
        if (!credentials.recaptchaToken) {
          throw new Error("Missing reCAPTCHA token");
        }

        const isHuman = await verifyRecaptcha(credentials.recaptchaToken as string);
        
        if (!isHuman) {
          throw new Error("reCAPTCHA validation failed. Are you a robot?");
        }

        // --- 3. Lanjut ke Logika Login Biasa ---
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
      if (!token || !token.accessToken) {
        throw new Error('No access token');
      }

      if (token.accessToken) {
        try {
          const secret = NEXTAUTH_SECRET;
          if (!secret) throw new Error('NEXTAUTH_SECRET (or fallback) is not defined');

          jwt.verify(token.accessToken as string, secret);

          const dbSession = await prisma.loginSession.findFirst({
            where: { accessToken: token.accessToken as string }
          });

          // console.log("Session check:", { found: !!dbSession });

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