import type { Metadata } from "next";
import { Geist, Geist_Mono, Rubik_Marker_Hatch } from "next/font/google";
import "./globals.css";
import { metadata as appMetadata } from './metadata'
import Providers from './components/provider/Providers'

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
        {children}
      </body>
    </html>
  );
}
