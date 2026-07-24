import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: "https://www.gameorilla.com/sitemap.xml",
    host: "https://www.gameorilla.com",
  };
}

