import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Career Automation - Cosmic Dark",
  description: "Next-generation career automation platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-background text-foreground antialiased selection:bg-purple-500/30">
        {/* Background Glow */}
        <div className="cosmic-glow" aria-hidden="true" />
        
        {/* Main Content */}
        <main className="relative z-10 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
