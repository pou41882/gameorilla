import type { MetadataRoute } from "next";

const pages = [
  "",
  "/games/fill-in-the-blank",
  "/how-to-play",
  "/faq",
  "/support",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((path, index) => ({
    url: `https://www.gameorilla.com${path}`,
    changeFrequency: index < 2 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : index === 1 ? 0.9 : 0.6,
  }));
}
