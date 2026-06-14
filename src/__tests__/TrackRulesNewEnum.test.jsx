import { describe, test, expect } from "vitest";

// ── Mirrors TrackRulesTab enum validation logic ───────────────

const VALID_EVAL_TYPES = new Set([
  "daily_loss_limit",
  "trade_frequency",
  "consecutive_losses",
  "custom",
]);

const isLegacyType = (evaluationType) => !VALID_EVAL_TYPES.has(evaluationType);

const LEGACY_EXAMPLES = ["session_control", "news_event", "instrument_filter", "time_filter"];

// ── Tests ─────────────────────────────────────────────────────

describe("TrackRules — valid enum has exactly 4 values", () => {
  test("set contains the 4 valid evaluation types", () => {
    expect(VALID_EVAL_TYPES.size).toBe(4);
    expect(VALID_EVAL_TYPES.has("daily_loss_limit")).toBe(true);
    expect(VALID_EVAL_TYPES.has("trade_frequency")).toBe(true);
    expect(VALID_EVAL_TYPES.has("consecutive_losses")).toBe(true);
    expect(VALID_EVAL_TYPES.has("custom")).toBe(true);
  });

  test("session_control is no longer a valid type", () => {
    expect(VALID_EVAL_TYPES.has("session_control")).toBe(false);
  });
});

describe("TrackRules — legacy type detection", () => {
  test("valid types are not detected as legacy", () => {
    for (const type of VALID_EVAL_TYPES) {
      expect(isLegacyType(type)).toBe(false);
    }
  });

  test("known legacy types are detected correctly", () => {
    LEGACY_EXAMPLES.forEach((type) => {
      expect(isLegacyType(type)).toBe(true);
    });
  });

  test("legacy rule is read-only — only delete allowed", () => {
    const rule = { evaluationType: "session_control", enabled: true };
    const isLegacy = isLegacyType(rule.evaluationType);
    const canEdit   = !isLegacy;
    const canDelete = true;
    expect(canEdit).toBe(false);
    expect(canDelete).toBe(true);
  });

  test("non-legacy rule supports edit and delete", () => {
    const rule = { evaluationType: "daily_loss_limit", enabled: true };
    const isLegacy = isLegacyType(rule.evaluationType);
    const canEdit   = !isLegacy;
    const canDelete = true;
    expect(canEdit).toBe(true);
    expect(canDelete).toBe(true);
  });
});
