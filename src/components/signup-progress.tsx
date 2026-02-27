type SignupProgressProps = {
  step: 1 | 2 | 3 | 4;
};

const STEP_LABELS = ["Details", "Verify", "Year", "Modules"] as const;

export function SignupProgress({ step }: SignupProgressProps) {
  return (
    <div className="steps" aria-label="Signup progress">
      {STEP_LABELS.map((label, index) => {
        const stepNumber = index + 1;
        const isDone = stepNumber < step;
        const isActive = stepNumber === step;
        return (
          <div
            key={label}
            style={{
              display: "contents",
            }}
          >
            <div className="step-item">
              <div
                className={`step-num ${isDone ? "done" : ""} ${
                  isActive ? "active" : ""
                }`}
              >
                {stepNumber}
              </div>
              <span className={`step-label ${isActive ? "active" : ""}`}>{label}</span>
            </div>
            {stepNumber < STEP_LABELS.length ? <div className="step-line" /> : null}
          </div>
        );
      })}
    </div>
  );
}
