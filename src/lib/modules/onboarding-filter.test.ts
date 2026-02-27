import { describe, expect, it } from 'vitest';
import { filterOnboardingModules, type OnboardingModuleOption } from '@/lib/modules/onboarding-filter';

const MODULES: OnboardingModuleOption[] = [
  { code: '50001', title: 'Algorithm Design and Analysis', studyYears: [2] },
  { code: '60010', title: 'Individual Project BEng', studyYears: [3] },
  { code: '70025', title: 'Scalable Systems and Data', studyYears: [4] },
  { code: '60032', title: 'Networked Systems', studyYears: [3, 4] },
];

describe('filterOnboardingModules', () => {
  it('returns all modules when year is not selected and query is empty', () => {
    expect(filterOnboardingModules(MODULES, null, '')).toEqual(MODULES);
  });

  it('keeps only modules offered in the selected year', () => {
    const result = filterOnboardingModules(MODULES, 3, '');
    expect(result.map((module) => module.code)).toEqual(['60010', '60032']);
  });

  it('applies query filtering after year filtering', () => {
    const result = filterOnboardingModules(MODULES, 4, 'data');
    expect(result.map((module) => module.code)).toEqual(['70025']);
  });

  it('matches query case-insensitively by title or code', () => {
    const byCode = filterOnboardingModules(MODULES, null, '60032');
    const byTitle = filterOnboardingModules(MODULES, null, 'algorithm');

    expect(byCode.map((module) => module.code)).toEqual(['60032']);
    expect(byTitle.map((module) => module.code)).toEqual(['50001']);
  });
});
