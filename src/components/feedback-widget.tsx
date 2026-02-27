"use client";

import { FormEvent, useState } from "react";
import { usePathname } from "next/navigation";
import { submitFeedback } from "@/lib/services/feedback-submit";

export function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("Could not submit right now.");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setStatus("error");
      setErrorMessage("Feedback must be between 1 and 4000 characters.");
      return;
    }

    setStatus("sending");
    setErrorMessage("Could not submit right now.");

    const result = await submitFeedback({
      message: trimmedMessage,
      pagePath: pathname ?? "/",
    });

    if (!result.ok) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }

    setStatus("success");
    setMessage("");
  }

  return (
    <div className="feedback-widget-shell">
      {open ? (
        <form className="feedback-widget-panel" onSubmit={handleSubmit}>
          <label className="feedback-widget-label" htmlFor="feedback-message">
            Share feedback
          </label>
          <textarea
            className="feedback-widget-textarea"
            id="feedback-message"
            maxLength={4000}
            onChange={(event) => {
              setMessage(event.target.value);
              if (status !== "idle") {
                setStatus("idle");
              }
              setErrorMessage("Could not submit right now.");
            }}
            placeholder="Tell us what to improve..."
            required
            rows={4}
            value={message}
          />
          <div className="feedback-widget-actions">
            <button
              className="feedback-widget-secondary"
              onClick={() => setOpen(false)}
              type="button"
            >
              Close
            </button>
            <button
              className="feedback-widget-submit"
              disabled={status === "sending" || message.trim().length < 1}
              type="submit"
            >
              {status === "sending" ? "Sending..." : "Send"}
            </button>
          </div>
          {status === "success" ? (
            <p className="feedback-widget-status">Thanks. Feedback submitted.</p>
          ) : null}
          {status === "error" ? (
            <p className="feedback-widget-status error">
              {errorMessage}
            </p>
          ) : null}
        </form>
      ) : null}
      <button
        className="feedback-widget-trigger"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        Feedback
      </button>
    </div>
  );
}
