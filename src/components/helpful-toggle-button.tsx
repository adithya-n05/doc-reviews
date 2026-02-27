"use client";

import { useState } from "react";

type HelpfulToggleButtonProps = {
  reviewId: string;
  initialCount: number;
  initiallyVoted: boolean;
};

type HelpfulApiResponse = {
  ok?: boolean;
  voted?: boolean;
  count?: number;
  error?: string;
};

export function HelpfulToggleButton({
  reviewId,
  initialCount,
  initiallyVoted,
}: HelpfulToggleButtonProps) {
  const [voted, setVoted] = useState(initiallyVoted);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    if (pending) {
      return;
    }

    const previousVoted = voted;
    const previousCount = count;
    const nextVoted = !voted;
    setVoted(nextVoted);
    setCount((value) => Math.max(0, value + (nextVoted ? 1 : -1)));
    setPending(true);

    try {
      const response = await fetch("/api/reviews/helpful", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ reviewId }),
      });

      const payload = (await response.json()) as HelpfulApiResponse;
      if (!response.ok || payload.ok !== true) {
        throw new Error(payload.error ?? "Unable to update helpful vote.");
      }

      setVoted(Boolean(payload.voted));
      setCount(typeof payload.count === "number" ? payload.count : previousCount);
    } catch {
      setVoted(previousVoted);
      setCount(previousCount);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      className={`helpful-btn ${voted ? "voted" : ""}`}
      onClick={handleToggle}
      type="button"
      aria-label={voted ? "Remove helpful vote" : "Mark review helpful"}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
      </svg>
      <span className="helpful-count">{count}</span>
      <span>Helpful</span>
    </button>
  );
}
