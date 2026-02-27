import { describe, expect, it, vi } from 'vitest';
import { createLogEntry, logError, logInfo, logWarn } from '@/lib/logging';

describe('logging utility', () => {
  it('creates a structured entry with level, message, context, and timestamp', () => {
    const entry = createLogEntry('info', 'test-message', { scope: 'unit' });

    expect(entry.level).toBe('info');
    expect(entry.message).toBe('test-message');
    expect(entry.context).toEqual({ scope: 'unit' });
    expect(Number.isNaN(Date.parse(entry.timestamp))).toBe(false);
  });

  it('writes info logs through console.info', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logInfo('info-message', { test: true });
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('writes warn logs through console.warn', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logWarn('warn-message', { test: true });
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('writes error logs through console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logError('error-message', { test: true });
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
