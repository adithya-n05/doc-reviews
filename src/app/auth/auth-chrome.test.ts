import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function source(path: string) {
  return readFileSync(path, 'utf8');
}

describe('auth pages chrome', () => {
  it('login page uses auth brand component and not SiteNav', () => {
    const login = source('src/app/auth/login/page.tsx');
    expect(login).toContain('import { AuthBrand } from "@/components/auth-brand";');
    expect(login).toContain('<AuthBrand />');
    expect(login).not.toContain('SiteNav');
  });

  it('signup page uses auth brand component and not SiteNav', () => {
    const signup = source('src/app/auth/signup/page.tsx');
    expect(signup).toContain('import { AuthBrand } from "@/components/auth-brand";');
    expect(signup).toContain('<AuthBrand />');
    expect(signup).not.toContain('SiteNav');
  });

  it('verify page uses auth brand component and not SiteNav', () => {
    const verify = source('src/app/auth/verify/page.tsx');
    expect(verify).toContain('import { AuthBrand } from "@/components/auth-brand";');
    expect(verify).toContain('<AuthBrand />');
    expect(verify).not.toContain('SiteNav');
  });
});
