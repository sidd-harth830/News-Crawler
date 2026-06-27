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

import { ThemeProvider } from "./providers";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-stone-50 dark:bg-neutral-950 text-slate-800 dark:text-white antialiased transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
