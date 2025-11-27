import type { Metadata } from "next";
import { Geist, Geist_Mono, Rubik_Marker_Hatch } from "next/font/google";
import "./globals.css";
import { metadata as appMetadata } from './metadata'
import { BubbleBackground } from "@/components/animate-ui/components/backgrounds/bubble";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMarkerHatch = Rubik_Marker_Hatch({
  variable: "--font-geist-marker-hatch",
  weight: "400",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = appMetadata

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${geistMarkerHatch.variable} antialiased flex items-center justify-center min-h-screen bg-gray-100 text-gray-900`}
      >
        <div className="relative overflow-hidden container mx-auto w-full md:max-w-md flex flex-col items-center justify-end h-screen text-white">
          <BubbleBackground className="absolute top-0 left-0 -z-10 w-full h-full" />
            {children}
        </div>
      </body>
    </html>
  );
}
