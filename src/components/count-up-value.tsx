"use client";

import { useEffect, useState } from "react";

type CountUpValueProps = {
  value: number;
  decimals?: number;
  durationMs?: number;
  className?: string;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function easeOutCubic(progress: number): number {
  return 1 - (1 - progress) ** 3;
}

function formatValue(value: number, decimals: number): string {
  if (decimals <= 0) {
    return String(Math.round(value));
  }
  return value.toFixed(decimals);
}

export function CountUpValue({
  value,
  decimals = 0,
  durationMs = 1200,
  className,
}: CountUpValueProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const safeDuration = Math.max(200, durationMs);

    if (prefersReducedMotion()) {
      const frameId = window.requestAnimationFrame(() => {
        setAnimatedValue(value);
      });
      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    let frameId = 0;
    const startedAt = performance.now();

    const update = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / safeDuration);
      const eased = easeOutCubic(progress);
      setAnimatedValue(value * eased);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(update);
      }
    };

    frameId = window.requestAnimationFrame(update);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [value, durationMs]);

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {formatValue(animatedValue, decimals)}
    </span>
  );
}
