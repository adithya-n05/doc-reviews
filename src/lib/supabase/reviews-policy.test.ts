import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const FIX_MIGRATION_PATH =
  'supabase/migrations/20260227030000_fix_reviews_insert_policy.sql';

describe('reviews insert policy migration', () => {
  it('exists as an incremental migration file', () => {
    expect(existsSync(FIX_MIGRATION_PATH)).toBe(true);
  });

  it('uses owner check without querying auth.users', () => {
    const migration = readFileSync(FIX_MIGRATION_PATH, 'utf8');

    expect(migration).toContain('create policy "reviews_insert_owner_verified"');
    expect(migration).toContain('with check (auth.uid() = user_id);');
    expect(migration).not.toContain('from auth.users');
  });
});
