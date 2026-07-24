import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: {
    default: "Madrasah Hub",
    template: "%s | Madrasah Hub",
  },
  description: "Sistem pengurusan madrasah untuk admin, guru dan ibu bapa.",
  applicationName: "Madrasah Hub",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/madrasah-hub-logo.svg",
    shortcut: "/madrasah-hub-logo.svg",
    apple: "/madrasah-hub-logo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Madrasah Hub",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#064E3B",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ms" className={geist.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
