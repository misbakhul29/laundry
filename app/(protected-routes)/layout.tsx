'use client';

import { BubbleBackground } from "@/components/animate-ui/components/backgrounds/bubble";
import Providers from "../components/provider/Providers";
import Navbar from "../components/ui/Navbar";
import AuthGuard from "../components/AuthGuard";

export default function PublicRoutesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative overflow-hidden container mx-auto w-full md:max-w-md flex flex-col items-center justify-end h-screen text-white">
      <BubbleBackground className="absolute top-0 left-0 -z-10 w-full h-full" />
      <Providers>
          <AuthGuard>
            {children}
          </AuthGuard>
      </Providers>
      <Navbar />
    </div>
  );
}