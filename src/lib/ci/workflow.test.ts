import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('ci workflow', () => {
  it('exists at .github/workflows/ci.yml', () => {
    expect(existsSync('.github/workflows/ci.yml')).toBe(true);
  });

  it('runs install, lint, test, and build on master pushes and pull requests', () => {
    const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');

    expect(workflow).toContain('push:');
    expect(workflow).toContain('pull_request:');
    expect(workflow).toContain('- master');
    expect(workflow).toContain('npm ci');
    expect(workflow).toContain('npm run lint');
    expect(workflow).toContain('npm test');
    expect(workflow).toContain('npm run build');
  });
});
