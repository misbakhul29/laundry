"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { ExtendedSession } from "@/app/api/auth/[...nextauth]/route";

export const useSessionValidation = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth");
    }

    if (status === "authenticated" && !session) {
      signOut({ callbackUrl: "/auth" });
    }
    
    if (session && !(session as Session).user) {
      signOut({ callbackUrl: "/auth" });
    }

    if (session && session.expires && new Date(session.expires) < new Date()) {
      const refreshToken = (session as ExtendedSession).refreshToken;
      if (refreshToken) {
        (async () => {
          try {
            const res = await fetch("/api/auth/refresh", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });
            const data = await res.json();
            if (res.ok && data?.ok) {
              router.refresh();
              return;
            }
          } catch (err) {
            console.error("Token refresh failed", err);
          }

          signOut({ callbackUrl: "/auth" });
        })();
      } else {
        // no refresh token available, sign out
        signOut({ callbackUrl: "/auth" });
      }
    }
  }, [session, status, router]);

  return { session, status };
};
