import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Bookmark } from 'lucide-react';
import "./globals.css";

import Logo from "./components/Logo";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "Omni-Channel Tech Radar",
  description: "AI-curated corporate tech intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-neutral-950 text-white antialiased`}>
        <nav className="fixed top-0 left-0 right-0 z-[60] bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-screen-2xl mx-auto px-4 md:px-12 xl:px-24 h-16 flex items-center justify-between">
            <a href="/" className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Logo className="h-10 w-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
              Radar
            </a>
            <div className="flex items-center gap-6 text-sm font-semibold text-neutral-400">
              <a href="/" className="hover:text-white transition-colors">Feed</a>
              <a href="/social" className="hover:text-orange-400 transition-colors">Social Hub</a>
              <a href="/watch" className="hover:text-red-500 transition-colors">Cinematic Hub</a>
              <a href="/analytics" className="hover:text-indigo-400 transition-colors">Analytics</a>
              <a href="/audit" className="hover:text-emerald-400 transition-colors">Audit Hub</a>
              <a href="/vault" className="hover:text-amber-400 transition-colors flex items-center gap-1.5"><Bookmark className="w-4 h-4" /> Vault</a>
            </div>
          </div>
        </nav>
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
