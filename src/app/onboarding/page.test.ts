import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('onboarding page nav', () => {
  it('renders authenticated navigation state', () => {
    const source = readFileSync('src/app/onboarding/page.tsx', 'utf8');
    expect(source).toContain('<SiteNav authed={true} />');
  });
});
