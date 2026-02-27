import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function source(path: string) {
  return readFileSync(path, 'utf8');
}

describe('signup progress usage', () => {
  it('signup page renders step 1 progress', () => {
    const signup = source('src/app/auth/signup/page.tsx');
    expect(signup).toContain('import { SignupProgress } from "@/components/signup-progress";');
    expect(signup).toContain('<SignupProgress step={1} />');
  });

  it('verify page renders step 2 progress', () => {
    const verify = source('src/app/auth/verify/page.tsx');
    expect(verify).toContain('import { SignupProgress } from "@/components/signup-progress";');
    expect(verify).toContain('<SignupProgress step={2} />');
  });

  it('onboarding page renders step 3 progress', () => {
    const onboarding = source('src/app/onboarding/page.tsx');
    expect(onboarding).toContain('import { SignupProgress } from "@/components/signup-progress";');
    expect(onboarding).toContain('<SignupProgress step={3} />');
  });
});
