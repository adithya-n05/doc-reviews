import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('application error pages', () => {
  it('provides a root not-found page with recovery links', () => {
    expect(existsSync('src/app/not-found.tsx')).toBe(true);
    const source = readFileSync('src/app/not-found.tsx', 'utf8');
    expect(source).toContain('Page Not Found');
    expect(source).toContain('href="/"');
    expect(source).toContain('href="/modules"');
  });

  it('provides a root error boundary with reset action', () => {
    expect(existsSync('src/app/error.tsx')).toBe(true);
    const source = readFileSync('src/app/error.tsx', 'utf8');
    expect(source).toContain('"use client";');
    expect(source).toContain('Something went wrong');
    expect(source).toContain('reset');
  });
});
