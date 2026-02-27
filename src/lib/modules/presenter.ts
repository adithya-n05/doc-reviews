import type { ModuleListItem } from "@/lib/modules/catalog";

type ModuleOfferingLite = {
  study_year: number;
};

type ModuleLeaderLite = {
  leader_name: string;
};

type ModuleAggregateLite = {
  review_count: number | null;
  avg_overall: number | null;
  avg_difficulty: number | null;
  avg_teaching: number | null;
  avg_workload: number | null;
  avg_assessment: number | null;
};

export type ModulePresentationRow = {
  id: string;
  code: string;
  title: string;
  description: string;
  module_offerings: ModuleOfferingLite[] | null;
  module_leaders: ModuleLeaderLite[] | null;
  module_review_aggregates: ModuleAggregateLite | ModuleAggregateLite[] | null;
};

export type ReviewPresentationRow = {
  id: string;
  user_id: string;
  module_id: string;
  teaching_rating: number;
  workload_rating: number;
  difficulty_rating: number;
  assessment_rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

type ProfileIdentity = {
  fullName: string;
  email: string;
  year: number | null;
};

export type PublicReview = {
  id: string;
  userId: string;
  reviewerName: string;
  reviewerEmail: string;
  reviewerInitials: string;
  year: number | null;
  teachingRating: number;
  workloadRating: number;
  difficultyRating: number;
  assessmentRating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

function pickAggregate(
  value: ModuleAggregateLite | ModuleAggregateLite[] | null,
): ModuleAggregateLite | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

function normalizeScore(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return value;
}

function normalizeCount(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.floor(value));
}

function dedupeStudyYears(offerings: ModuleOfferingLite[] | null): number[] {
  if (!offerings) {
    return [];
  }

  const deduped = new Set<number>();
  for (const offering of offerings) {
    if (offering.study_year >= 1 && offering.study_year <= 4) {
      deduped.add(offering.study_year);
    }
  }

  return Array.from(deduped).sort((a, b) => a - b);
}

export function toModuleListItem(row: ModulePresentationRow): ModuleListItem & {
  description: string;
  leaders: string[];
  avgTeaching: number;
  avgWorkload: number;
  avgAssessment: number;
} {
  const aggregate = pickAggregate(row.module_review_aggregates);
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    studyYears: dedupeStudyYears(row.module_offerings),
    leaders: (row.module_leaders ?? []).map((leader) => leader.leader_name),
    reviewCount: normalizeCount(aggregate?.review_count),
    avgOverall: normalizeScore(aggregate?.avg_overall),
    avgDifficulty: normalizeScore(aggregate?.avg_difficulty),
    avgTeaching: normalizeScore(aggregate?.avg_teaching),
    avgWorkload: normalizeScore(aggregate?.avg_workload),
    avgAssessment: normalizeScore(aggregate?.avg_assessment),
  };
}

export function toPublicReviewerInitials(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return "?";
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "?";
  }
  if (words.length === 1) {
    return words[0][0]?.toUpperCase() ?? "?";
  }
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

export function mapReviewsWithProfiles(
  reviews: ReviewPresentationRow[],
  profilesById: Record<string, ProfileIdentity>,
): PublicReview[] {
  return reviews.map((review) => {
    const profile = profilesById[review.user_id];
    if (!profile) {
      throw new Error(`Missing profile for review user: ${review.user_id}`);
    }

    const fullName = profile.fullName.trim();
    const email = profile.email.trim().toLowerCase();
    if (!fullName || !email) {
      throw new Error(`Review identity is incomplete for user: ${review.user_id}`);
    }

    return {
      id: review.id,
      userId: review.user_id,
      reviewerName: fullName,
      reviewerEmail: email,
      reviewerInitials: toPublicReviewerInitials(fullName),
      year: profile.year,
      teachingRating: review.teaching_rating,
      workloadRating: review.workload_rating,
      difficultyRating: review.difficulty_rating,
      assessmentRating: review.assessment_rating,
      comment: review.comment,
      createdAt: review.created_at,
      updatedAt: review.updated_at,
    };
  });
}
