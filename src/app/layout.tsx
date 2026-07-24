import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: {
    default: "Portal Madrasah",
    template: "%s | Portal Madrasah",
  },
  description: "Sistem pengurusan sekolah madrasah dan portal ibu bapa.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#167D55",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ms" className={geist.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
