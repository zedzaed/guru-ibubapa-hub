import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Madrasah Connect",
    template: "%s | Madrasah Connect",
  },
  description:
    "Sistem pengurusan madrasah dan portal ibu bapa untuk kehadiran, hafazan, keputusan serta yuran.",
  applicationName: "Madrasah Connect",
  authors: [{ name: "Madrasah Connect" }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
