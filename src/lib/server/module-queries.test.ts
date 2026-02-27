import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module review query shape", () => {
  const source = readFileSync("src/lib/server/module-queries.ts", "utf8");

  it("includes tips in module reviews query select list", () => {
    expect(source).toContain(
      "id,user_id,module_id,teaching_rating,workload_rating,difficulty_rating,assessment_rating,comment,tips,created_at,updated_at",
    );
  });
});
