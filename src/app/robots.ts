import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  const siteOrigin = getSiteOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/auth/", "/onboarding/", "/profile/"],
    },
    sitemap: `${siteOrigin}/sitemap.xml`,
    host: siteOrigin,
  };
}
