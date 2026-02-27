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
    >
      {voted ? "✓ Helpful" : "Helpful"} ({count})
    </button>
  );
}
