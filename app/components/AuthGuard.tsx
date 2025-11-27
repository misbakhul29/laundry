"use client";

import { useSessionValidation } from "@/lib/sessionCheck";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSessionValidation();

  if (status === "loading") {
    return <div>Loading...</div>; 
  }

  if (status === "unauthenticated") {
      return null;
  }

  return <>{children}</>;
}
