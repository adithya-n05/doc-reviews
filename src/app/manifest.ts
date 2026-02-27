import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "DoC Reviews",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF7",
    theme_color: "#003E74",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32",
        type: "image/x-icon",
      },
    ],
  };
}
