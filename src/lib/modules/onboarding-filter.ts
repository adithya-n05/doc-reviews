export type OnboardingModuleOption = {
  code: string;
  title: string;
  studyYears: number[];
};

export function filterOnboardingModules(
  modules: OnboardingModuleOption[],
  selectedYear: number | null,
  query: string,
): OnboardingModuleOption[] {
  const normalizedQuery = query.trim().toLowerCase();

  return modules.filter((module) => {
    const yearMatches =
      selectedYear === null || module.studyYears.includes(selectedYear);
    const queryMatches =
      normalizedQuery.length === 0 ||
      module.code.toLowerCase().includes(normalizedQuery) ||
      module.title.toLowerCase().includes(normalizedQuery);

    return yearMatches && queryMatches;
  });
}
