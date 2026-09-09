import type { Metadata } from "next";
import { Suspense } from "react";
import { Outfit, Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import NetworkProgressBar from "@/components/ui/NetworkProgressBar";
import NetworkStatusListener from "@/components/ui/NetworkStatusListener";
import DomainIntegrityGuard from "@/components/security/DomainIntegrityGuard";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Seneca Academy — Premier School Management System & LMS",
  description:
    "Official portal and comprehensive learning management system for Seneca Academy. Shaping tomorrow's leaders through academic rigor and character building.",
  keywords: [
    "Seneca Academy",
    "School LMS",
    "School Management System",
    "Online Education",
    "Student Portal",
    "Teacher Portal",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${plusJakartaSans.variable} ${inter.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen font-sans antialiased bg-background text-foreground selection:bg-seneca-crimson selection:text-white transition-colors duration-200 overflow-x-clip w-full max-w-full"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <NetworkProgressBar />
          </Suspense>
          <NetworkStatusListener />
          <DomainIntegrityGuard />
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
