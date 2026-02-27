import { describe, expect, it } from "vitest";
import {
  mapReviewsWithProfiles,
  toModuleListItem,
  toPublicReviewerInitials,
  type ModulePresentationRow,
  type ReviewPresentationRow,
} from "@/lib/modules/presenter";

const BASE_ROW: ModulePresentationRow = {
  id: "module-1",
  code: "40008",
  title: "Graphs and Algorithms",
  description: "Core algorithms module.",
  module_offerings: [
    { study_year: 2 },
    { study_year: 1 },
    { study_year: 1 },
  ],
  module_leaders: [
    {
      leader_name: "Prof. Susan Bhattacharya",
      profile_url: "https://profiles.imperial.ac.uk/s.bhattacharya",
      photo_url: "https://example.com/susan.jpg",
    },
  ],
  module_review_aggregates: {
    review_count: 42,
    avg_overall: 4.3,
    avg_difficulty: 3.4,
    avg_teaching: 4.1,
    avg_workload: 3.8,
    avg_assessment: 3.9,
  },
};

describe("toModuleListItem", () => {
  it("normalizes years, leaders, and aggregate values", () => {
    const item = toModuleListItem(BASE_ROW);
    expect(item.code).toBe("40008");
    expect(item.studyYears).toEqual([1, 2]);
    expect(item.leaders).toEqual([
      {
        name: "Prof. Susan Bhattacharya",
        profileUrl: "https://profiles.imperial.ac.uk/s.bhattacharya",
        photoUrl: "https://example.com/susan.jpg",
      },
    ]);
    expect(item.reviewCount).toBe(42);
    expect(item.avgOverall).toBe(4.3);
    expect(item.avgDifficulty).toBe(3.4);
  });

  it("handles array aggregate payloads from relational selects", () => {
    const item = toModuleListItem({
      ...BASE_ROW,
      module_review_aggregates: [
        {
          review_count: 12,
          avg_overall: 3.88,
          avg_difficulty: 4.11,
          avg_teaching: 3.2,
          avg_workload: 4.2,
          avg_assessment: 4.0,
        },
      ],
    });
    expect(item.reviewCount).toBe(12);
    expect(item.avgOverall).toBe(3.88);
    expect(item.avgDifficulty).toBe(4.11);
  });

  it("defaults aggregate and relation values for sparse rows", () => {
    const item = toModuleListItem({
      ...BASE_ROW,
      module_offerings: null,
      module_leaders: null,
      module_review_aggregates: null,
    });
    expect(item.studyYears).toEqual([]);
    expect(item.leaders).toEqual([]);
    expect(item.reviewCount).toBe(0);
    expect(item.avgOverall).toBe(0);
    expect(item.avgDifficulty).toBe(0);
  });

  it("normalizes optional leader profile/photo urls", () => {
    const item = toModuleListItem({
      ...BASE_ROW,
      module_leaders: [
        {
          leader_name: "Dr Iain Phillips",
          profile_url: null,
          photo_url: null,
        },
      ],
    });

    expect(item.leaders).toEqual([
      {
        name: "Dr Iain Phillips",
        profileUrl: null,
        photoUrl: null,
      },
    ]);
  });
});

describe("toPublicReviewerInitials", () => {
  it("creates initials from display names", () => {
    expect(toPublicReviewerInitials("Sophie Malik")).toBe("SM");
    expect(toPublicReviewerInitials("Raj")).toBe("R");
    expect(toPublicReviewerInitials("  Lena   Patel  ")).toBe("LP");
  });
});

describe("mapReviewsWithProfiles", () => {
  const reviews: ReviewPresentationRow[] = [
    {
      id: "r1",
      user_id: "u1",
      module_id: "m1",
      teaching_rating: 5,
      workload_rating: 4,
      difficulty_rating: 3,
      assessment_rating: 4,
      comment:
        "This module was excellent and clear. Weekly tutorials were genuinely helpful and rewarding throughout the term.",
      tips: "Start tutorial sheets early every week.",
      created_at: "2026-01-10T00:00:00.000Z",
      updated_at: "2026-01-10T00:00:00.000Z",
    },
  ];

  it("attaches public reviewer identity to each review", () => {
    const mapped = mapReviewsWithProfiles(reviews, {
      u1: {
        fullName: "Sophie M.",
        email: "sm123@ic.ac.uk",
        year: 1,
      },
    });
    expect(mapped).toHaveLength(1);
    expect(mapped[0].reviewerName).toBe("Sophie M.");
    expect(mapped[0].reviewerEmail).toBe("sm123@ic.ac.uk");
    expect(mapped[0].reviewerInitials).toBe("SM");
    expect(mapped[0].tips).toBe("Start tutorial sheets early every week.");
  });

  it("throws when profile is missing to prevent anonymous rendering", () => {
    expect(() => mapReviewsWithProfiles(reviews, {})).toThrow(
      "Missing profile for review user: u1",
    );
  });

  it("throws when profile has empty name or email", () => {
    expect(() =>
      mapReviewsWithProfiles(reviews, {
        u1: { fullName: "", email: "sm123@ic.ac.uk", year: 1 },
      }),
    ).toThrow("Review identity is incomplete for user: u1");

    expect(() =>
      mapReviewsWithProfiles(reviews, {
        u1: { fullName: "Sophie M.", email: "", year: 1 },
      }),
    ).toThrow("Review identity is incomplete for user: u1");
  });
});
