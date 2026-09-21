import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "./components/navigation";
import "./globals.css"
import Image from "next/image";
import { Qwitcher_Grypen  } from 'next/font/google'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const qwitcherGrypen = Qwitcher_Grypen({
  variable: "--font-qwitcher-grypen",
  subsets: ["latin"],
  weight: "400"
});

export const metadata: Metadata = {
  title: "UCSC Treenets",
  description: "Weaving at Universit of California, Santa Cruz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${qwitcherGrypen.variable} h-full antialiased`}
    >
      <body>
        <main className="relative min-h-full flex flex-col">

          <Navigation />
          {children}
          <footer className="text-[min(1.9vw,0.55rem)] fixed bottom-0 w-full justify-between py-2 pt-2 sm:pt-3 px-16 bg-white/60 backdrop-blur-md items-start z-30 text-zinc-700">
            <p>&copy; 2026 Weavers of Santa Cruz. All Rights Reserved</p>
            <p className="">NOT AFFILIATED WITH THE UNIVERSITY OF CALIFORNIA, SANTA CRUZ</p>
          </footer>
        </main>
      </body>
    </html>
  );
}
