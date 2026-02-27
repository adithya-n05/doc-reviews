import { saveOnboardingAction } from "@/app/actions/onboarding";
import { ModuleChecklist } from "@/components/module-checklist";
import { SiteNav } from "@/components/site-nav";
import { requireUserContext } from "@/lib/server/auth-context";

type OnboardingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ModuleRow = {
  id: string;
  code: string;
  title: string;
  module_offerings: Array<{ study_year: number }> | null;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

const DEGREE_TRACK_OPTIONS = [
  "BEng Computing",
  "MEng Computing",
  "MEng Computing - Artificial Intelligence and Machine Learning",
  "MEng Computing - Software Engineering",
  "MEng Computing - Security and Reliability",
  "MEng Computing - Visual Computing and Robotics",
  "MEng Computing - Management and Finance",
  "MEng Computing - International Programme",
];

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const { client, profile } = await requireUserContext({
    requireVerified: true,
  });
  const resolved = (await searchParams) ?? {};
  const error = getParam(resolved, "error");

  const { data: modules } = await client
    .from("modules")
    .select("id,code,title,module_offerings(study_year)")
    .order("code", { ascending: true });

  const { data: selectedRows } = await client
    .from("user_modules")
    .select("module_id")
    .eq("user_id", profile.id);

  const selectedIds = new Set((selectedRows ?? []).map((row) => row.module_id));
  const moduleOptions = ((modules ?? []) as ModuleRow[]).map((module) => ({
    id: module.id,
    code: module.code,
    title: module.title,
    studyYears: Array.from(
      new Set((module.module_offerings ?? []).map((offering) => offering.study_year)),
    ).sort((a, b) => a - b),
  }));

  const initialSelectedCodes = moduleOptions
    .filter((module) => selectedIds.has(module.id))
    .map((module) => module.code);

  return (
    <div className="site-shell">
      <SiteNav authed={false} />
      <main className="auth-wrap">
        <section className="auth-card" style={{ width: "min(760px, 100%)" }}>
          <p className="label-caps">Create Your Account</p>
          <h1 className="auth-title">Step 3 and 4 - Year and Module Selection</h1>
          <p className="auth-subtitle">
            Choose your current year and modules. This controls what you can review.
          </p>

          {error ? <p className="form-banner error">{error}</p> : null}

          <form action={saveOnboardingAction}>
            <div className="inline-row">
              <div className="form-group" style={{ flex: 1, minWidth: "160px" }}>
                <label className="form-label" htmlFor="onboarding-year">
                  Current Year
                </label>
                <select
                  id="onboarding-year"
                  name="year"
                  className="form-select"
                  defaultValue={String(profile.year ?? "")}
                  required
                >
                  <option value="">Select year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4 / MEng</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: 3, minWidth: "260px" }}>
                <label className="form-label" htmlFor="onboarding-degree-track">
                  Degree Track
                </label>
                <select
                  id="onboarding-degree-track"
                  name="degreeTrack"
                  className="form-select"
                  defaultValue={profile.degree_track ?? ""}
                  required
                >
                  <option value="">Select degree track</option>
                  {DEGREE_TRACK_OPTIONS.map((track) => (
                    <option key={track} value={track}>
                      {track}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Modules</label>
              <ModuleChecklist
                modules={moduleOptions}
                initialSelected={initialSelectedCodes}
              />
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">
                Complete Setup
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
