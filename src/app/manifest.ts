import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-metadata";

const ICON_ASSET_VERSION = "20260227-3";

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
        src: `/favicon.ico?v=${ICON_ASSET_VERSION}`,
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
      {
        src: `/android-chrome-192x192.png?v=${ICON_ASSET_VERSION}`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `/android-chrome-512x512.png?v=${ICON_ASSET_VERSION}`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
