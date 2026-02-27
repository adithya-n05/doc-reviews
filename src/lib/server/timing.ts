export function startTiming(): number {
  return Date.now();
}

export function elapsedMs(startTimeMs: number): number {
  return Date.now() - startTimeMs;
}
