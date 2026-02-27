import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const WORKFLOW_PATH = '.github/workflows/preview-safe.yml';

describe('preview-safe workflow', () => {
  it('exists as a dedicated workflow file', () => {
    expect(existsSync(WORKFLOW_PATH)).toBe(true);
  });

  it('runs lint, test, and build on pull requests and supports manual production gate', () => {
    const workflow = readFileSync(WORKFLOW_PATH, 'utf8');

    expect(workflow).toContain('pull_request:');
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain('npm ci');
    expect(workflow).toContain('npm run lint');
    expect(workflow).toContain('npm test');
    expect(workflow).toContain('npm run build');
    expect(workflow).toContain('name: optional-production-gate');
  });
});
