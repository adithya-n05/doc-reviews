import { beforeEach, describe, expect, it } from "vitest";
import { buildAbsoluteUrl, getSiteOrigin, resetSiteOriginCacheForTests } from "./urls";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  resetSiteOriginCacheForTests();
});

describe("getSiteOrigin", () => {
  it("prefers NEXT_PUBLIC_SITE_URL when set", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://doc-reviews.app";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "doc-reviews.vercel.app";

    expect(getSiteOrigin()).toBe("https://doc-reviews.app");
  });

  it("uses VERCEL_PROJECT_PRODUCTION_URL when site url is unset", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "doc-reviews.vercel.app";

    expect(getSiteOrigin()).toBe("https://doc-reviews.vercel.app");
  });

  it("falls back to localhost for local development", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;

    expect(getSiteOrigin()).toBe("http://localhost:3000");
  });
});

describe("buildAbsoluteUrl", () => {
  it("builds absolute urls for relative paths", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://doc-reviews.app";

    expect(buildAbsoluteUrl("/auth/verify")).toBe(
      "https://doc-reviews.app/auth/verify",
    );
  });

  it("passes absolute urls through unchanged", () => {
    expect(buildAbsoluteUrl("https://example.com/a")).toBe(
      "https://example.com/a",
    );
  });
});
