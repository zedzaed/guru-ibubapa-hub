import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Madrasah Hub",
    short_name: "Madrasah Hub",
    description: "Portal pengurusan madrasah untuk admin, guru dan ibu bapa.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F8F4",
    theme_color: "#064E3B",
    orientation: "portrait-primary",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/madrasah-hub-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}
