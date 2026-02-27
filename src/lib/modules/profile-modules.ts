type ModuleRelation = {
  id: string;
  code: string;
  title: string;
};

type RawUserModuleRow = {
  module_id: string;
  modules: ModuleRelation | ModuleRelation[] | null;
};

export type UserModuleSummary = {
  id: string;
  code: string;
  title: string;
};

function pickModuleRelation(
  value: RawUserModuleRow["modules"],
): ModuleRelation | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

export function normalizeUserModuleRows(
  rows: RawUserModuleRow[],
): UserModuleSummary[] {
  const modules: UserModuleSummary[] = [];

  for (const row of rows) {
    const module = pickModuleRelation(row.modules);
    if (!module) {
      continue;
    }

    modules.push({
      id: module.id,
      code: module.code,
      title: module.title,
    });
  }

  return modules;
}
