"use client";

import { FormEvent, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { submitFeedback } from "@/lib/services/feedback-submit";

type FeedbackTypeOption = {
  id: "general" | "bug" | "feature" | "ui" | "data" | "other";
  label: string;
  icon: string;
};

const FEEDBACK_TYPES: FeedbackTypeOption[] = [
  { id: "general", label: "General", icon: "✍️" },
  { id: "bug", label: "Bug", icon: "🐞" },
  { id: "feature", label: "Feature", icon: "✨" },
  { id: "ui", label: "UI", icon: "🎨" },
  { id: "data", label: "Data", icon: "📊" },
  { id: "other", label: "Other", icon: "🧩" },
];

export function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<FeedbackTypeOption["id"]>("general");
  const [errorMessage, setErrorMessage] = useState("Could not submit right now.");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );

  const feedbackContext = useMemo(
    () => ({
      source: "floating-feedback-widget",
      path: pathname ?? "/",
      timestamp: new Date().toISOString(),
      userAgent:
        typeof navigator === "undefined" ? "server" : navigator.userAgent.slice(0, 120),
    }),
    [pathname],
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
      feedbackType,
      context: feedbackContext,
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
      <button
        className="feedback-trigger"
        onClick={() => {
          setOpen(true);
          setStatus("idle");
        }}
        type="button"
      >
        Feedback
      </button>

      <button
        className={`feedback-overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
        type="button"
        aria-label="Close feedback panel"
      />

      <aside className={`feedback-panel ${open ? "open" : ""}`}>
        <div className="feedback-panel-header">
          <h2 className="feedback-panel-title">Share feedback</h2>
          <button
            className="feedback-panel-close"
            onClick={() => setOpen(false)}
            type="button"
            aria-label="Close feedback panel"
          >
            ×
          </button>
        </div>

        <form className="feedback-panel-body" onSubmit={handleSubmit}>
          <div className="feedback-type-grid">
            {FEEDBACK_TYPES.map((type) => (
              <button
                key={type.id}
                className={`feedback-type-btn ${feedbackType === type.id ? "active" : ""}`}
                onClick={() => setFeedbackType(type.id)}
                type="button"
              >
                <div className="feedback-type-icon" aria-hidden="true">
                  {type.icon}
                </div>
                <div className="feedback-type-label">{type.label}</div>
              </button>
            ))}
          </div>

          <label className="label-caps feedback-widget-label" htmlFor="feedback-message">
            What should we improve?
          </label>
          <textarea
            className="form-input feedback-widget-textarea"
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
            rows={7}
            value={message}
          />

          <div className="feedback-widget-actions">
            <button
              className="btn btn-ghost btn-sm feedback-widget-secondary"
              onClick={() => {
                setMessage("");
                setStatus("idle");
              }}
              type="button"
            >
              Clear
            </button>
            <button
              className="btn btn-primary btn-sm feedback-widget-submit"
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
            <p className="feedback-widget-status error">{errorMessage}</p>
          ) : null}
        </form>
      </aside>
    </div>
  );
}
