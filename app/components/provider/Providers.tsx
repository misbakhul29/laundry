"use client";

import React, { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import NotificationProvider from "./NotificationProvider";
import ChaptaProvider from "./GoogleReChaptaProvider";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ChaptaProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </ChaptaProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
