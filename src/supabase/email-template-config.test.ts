import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("supabase auth email branding config", () => {
  const config = readFileSync("supabase/config.toml", "utf8");
  const template = readFileSync("supabase/templates/confirmation.html", "utf8");

  it("wires confirmation emails to a custom branded html template", () => {
    expect(config).toContain("[auth.email.template.confirmation]");
    expect(config).toContain('subject = "Confirm your DoC Reviews account"');
    expect(config).toContain('content_path = "./supabase/templates/confirmation.html"');
  });

  it("declares SMTP sender settings via environment variables", () => {
    expect(config).toContain("[auth.email.smtp]");
    expect(config).toContain('admin_email = "env(SUPABASE_AUTH_SMTP_ADMIN_EMAIL)"');
    expect(config).toContain('sender_name = "DoC Reviews"');
  });

  it("uses branded confirmation template content with Supabase URL placeholder", () => {
    expect(template).toContain("DoC Reviews");
    expect(template).toContain("Imperial Computing");
    expect(template).toContain("{{ .ConfirmationURL }}");
  });
});
