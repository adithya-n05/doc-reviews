import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('auth callback route logging', () => {
  it('logs when callback code is missing or exchange fails', () => {
    const source = readFileSync('src/app/auth/callback/route.ts', 'utf8');

    expect(source).toContain('import { logError } from "@/lib/logging";');
    expect(source).toContain('logError("auth_callback_missing_code"');
    expect(source).toContain('logError("auth_callback_exchange_failed"');
  });
});
