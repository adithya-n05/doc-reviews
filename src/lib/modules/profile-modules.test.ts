import { describe, expect, it } from "vitest";
import { normalizeUserModuleRows } from "@/lib/modules/profile-modules";

describe("normalizeUserModuleRows", () => {
  it("accepts Supabase relation payload when modules is an object", () => {
    const normalized = normalizeUserModuleRows([
      {
        module_id: "m-1",
        modules: {
          id: "m-1",
          code: "50004",
          title: "Operating Systems",
        },
      },
    ]);

    expect(normalized).toEqual([
      {
        id: "m-1",
        code: "50004",
        title: "Operating Systems",
      },
    ]);
  });

  it("accepts Supabase relation payload when modules is an array", () => {
    const normalized = normalizeUserModuleRows([
      {
        module_id: "m-2",
        modules: [
          {
            id: "m-2",
            code: "50001",
            title: "Algorithm Design",
          },
        ],
      },
    ]);

    expect(normalized).toEqual([
      {
        id: "m-2",
        code: "50001",
        title: "Algorithm Design",
      },
    ]);
  });

  it("drops rows with missing module relation payload", () => {
    const normalized = normalizeUserModuleRows([
      {
        module_id: "m-3",
        modules: null,
      },
    ]);

    expect(normalized).toEqual([]);
  });
});
