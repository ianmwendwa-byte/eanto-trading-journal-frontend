import { describe, test, expect } from "vitest";
import { calculateConfluence } from "@/components/strategy/SetupCriteriaChecklist";

// ── Fixtures ──────────────────────────────────────────────────

const makeCriteria = (list) =>
  list.map((item, i) => ({
    id: `c${i}`,
    label: item.label ?? `Criterion ${i}`,
    category: "confirmation",
    required: item.required ?? false,
  }));

// ── Tests ─────────────────────────────────────────────────────

describe("calculateConfluence — all_required mode", () => {
  test("vacuously true when no required criteria exist", () => {
    const criteria    = makeCriteria([{ required: false }, { required: false }]);
    const checkedMap  = { c0: true, c1: false };
    const confluence  = { mode: "all_required" };
    expect(calculateConfluence(criteria, confluence, checkedMap)).toBe(true);
  });

  test("true when all required criteria are checked", () => {
    const criteria    = makeCriteria([{ required: true }, { required: false }, { required: true }]);
    const checkedMap  = { c0: true, c1: false, c2: true };
    const confluence  = { mode: "all_required" };
    expect(calculateConfluence(criteria, confluence, checkedMap)).toBe(true);
  });

  test("false when a required criterion is not checked", () => {
    const criteria    = makeCriteria([{ required: true }, { required: true }]);
    const checkedMap  = { c0: true, c1: false };
    const confluence  = { mode: "all_required" };
    expect(calculateConfluence(criteria, confluence, checkedMap)).toBe(false);
  });

  test("optional unchecked does not affect result", () => {
    const criteria    = makeCriteria([{ required: true }, { required: false }]);
    const checkedMap  = { c0: true, c1: false };
    const confluence  = { mode: "all_required" };
    expect(calculateConfluence(criteria, confluence, checkedMap)).toBe(true);
  });

  test("defaults to all_required when confluence is undefined", () => {
    const criteria   = makeCriteria([{ required: true }]);
    const checkedMap = { c0: true };
    expect(calculateConfluence(criteria, undefined, checkedMap)).toBe(true);
  });
});

describe("calculateConfluence — min_count mode", () => {
  test("true when checked count meets minCount", () => {
    const criteria    = makeCriteria([{}, {}, {}]);
    const checkedMap  = { c0: true, c1: true, c2: false };
    const confluence  = { mode: "min_count", minCount: 2 };
    expect(calculateConfluence(criteria, confluence, checkedMap)).toBe(true);
  });

  test("false when checked count is below minCount", () => {
    const criteria    = makeCriteria([{}, {}, {}]);
    const checkedMap  = { c0: true, c1: false, c2: false };
    const confluence  = { mode: "min_count", minCount: 2 };
    expect(calculateConfluence(criteria, confluence, checkedMap)).toBe(false);
  });

  test("counts both required and optional checked items", () => {
    const criteria    = makeCriteria([{ required: true }, { required: false }, { required: false }]);
    const checkedMap  = { c0: true, c1: true, c2: false };
    const confluence  = { mode: "min_count", minCount: 2 };
    expect(calculateConfluence(criteria, confluence, checkedMap)).toBe(true);
  });
});
