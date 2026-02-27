"use client";

import { useState } from "react";

type ReviewRatingFieldsProps = {
  defaults: {
    teaching: number;
    workload: number;
    difficulty: number;
    assessment: number;
  };
};

type RatingName =
  | "teachingRating"
  | "workloadRating"
  | "difficultyRating"
  | "assessmentRating";

function RatingRow(props: {
  label: string;
  name: RatingName;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  return (
    <div className="star-row">
      <span className="star-row-label">
        {props.label}
        {props.hint ? (
          <span style={{ color: "var(--ink-light)", fontSize: "12px" }}> ({props.hint})</span>
        ) : null}
      </span>
      <div className="stars-interactive">
        {Array.from({ length: 5 }).map((_, index) => {
          const rating = index + 1;
          return (
            <button
              key={`${props.name}-${rating}`}
              type="button"
              className={`star-btn ${rating <= props.value ? "filled" : ""}`}
              aria-label={`Set ${props.label} rating to ${rating}`}
              onClick={() => props.onChange(rating)}
            >
              ★
            </button>
          );
        })}
      </div>
      <input type="hidden" name={props.name} value={props.value} />
    </div>
  );
}

export function ReviewRatingFields({ defaults }: ReviewRatingFieldsProps) {
  const [teaching, setTeaching] = useState(defaults.teaching);
  const [workload, setWorkload] = useState(defaults.workload);
  const [difficulty, setDifficulty] = useState(defaults.difficulty);
  const [assessment, setAssessment] = useState(defaults.assessment);

  return (
    <div className="form-group" style={{ marginBottom: "28px" }}>
      <div className="form-label" style={{ marginBottom: "12px" }}>
        Your Ratings
      </div>
      <RatingRow label="Teaching Quality" name="teachingRating" value={teaching} onChange={setTeaching} />
      <RatingRow label="Workload" name="workloadRating" value={workload} onChange={setWorkload} hint="1 = very light, 5 = very heavy" />
      <RatingRow
        label="Difficulty"
        name="difficultyRating"
        value={difficulty}
        onChange={setDifficulty}
        hint="1 = very easy, 5 = very hard"
      />
      <RatingRow
        label="Assessment Fairness"
        name="assessmentRating"
        value={assessment}
        onChange={setAssessment}
      />
    </div>
  );
}
