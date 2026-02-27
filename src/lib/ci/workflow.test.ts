import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('ci workflow', () => {
  it('exists at .github/workflows/ci.yml', () => {
    expect(existsSync('.github/workflows/ci.yml')).toBe(true);
  });
});
