import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/*", // API routes
          "/*/(auth)/*", // Auth pages (login, register)
          "/*/(protected)/*", // Protected dashboard pages
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
