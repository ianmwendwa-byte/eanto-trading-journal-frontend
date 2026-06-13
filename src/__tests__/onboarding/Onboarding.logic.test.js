import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

// ── Inline helpers extracted from Onboarding.jsx ──────────────────
// (tested here without rendering the full component)

const makeDraftKey = (userId) => `kv_onboarding_draft_${userId ?? "guest"}`;

const loadDraft = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveDraft = (key, step, wizardData) => {
  try {
    localStorage.setItem(key, JSON.stringify({ step, wizardData }));
  } catch {}
};

const clearDraft = (key) => {
  try { localStorage.removeItem(key); } catch {}
};

const profileValidFromDraft = (d) =>
  !!(d?.firstName?.length >= 2 && d?.lastName?.length >= 2 &&
     d?.phoneNumber?.length >= 5 && d?.timezone);

// Mirrors canContinue() from Onboarding.jsx
const canContinue = (step, wizardData, profileValid) => {
  if (step === 1) return !!(wizardData.traderType && wizardData.experienceLevel);
  if (step === 2) return profileValid;
  if (step === 3) return wizardData.tradingStyles.length > 0;
  return true;
};

// Mirrors getNextStep from FRONTEND.md
const getNextStep = (completedSteps, isGoogleUser = false) => {
  const steps = [
    ...(!isGoogleUser ? ["email_verified"] : []),
    "profile_setup",
    "preferences_set",
    "first_account_created",
  ];
  return steps.find((s) => !completedSteps.includes(s)) ?? "done";
};

// ── makeDraftKey ──────────────────────────────────────────────────

describe("makeDraftKey", () => {
  test("includes userId when provided", () => {
    expect(makeDraftKey("user-123")).toBe("kv_onboarding_draft_user-123");
  });

  test("falls back to 'guest' when userId is null", () => {
    expect(makeDraftKey(null)).toBe("kv_onboarding_draft_guest");
  });

  test("falls back to 'guest' when userId is undefined", () => {
    expect(makeDraftKey(undefined)).toBe("kv_onboarding_draft_guest");
  });

  test("different users get different keys", () => {
    expect(makeDraftKey("user-1")).not.toBe(makeDraftKey("user-2"));
  });
});

// ── Draft persistence ─────────────────────────────────────────────

describe("draft save / load / clear", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  test("saveDraft writes step and wizardData to localStorage", () => {
    const key = "kv_onboarding_draft_test";
    const data = { firstName: "Ian", traderType: "manual" };
    saveDraft(key, 2, data);
    const stored = JSON.parse(localStorage.getItem(key));
    expect(stored.step).toBe(2);
    expect(stored.wizardData.firstName).toBe("Ian");
  });

  test("loadDraft returns saved data", () => {
    const key = "kv_onboarding_draft_test";
    saveDraft(key, 3, { timezone: "UTC" });
    const draft = loadDraft(key);
    expect(draft.step).toBe(3);
    expect(draft.wizardData.timezone).toBe("UTC");
  });

  test("loadDraft returns null when key not found", () => {
    expect(loadDraft("nonexistent_key")).toBeNull();
  });

  test("clearDraft removes the key from localStorage", () => {
    const key = "kv_onboarding_draft_test";
    saveDraft(key, 2, {});
    clearDraft(key);
    expect(localStorage.getItem(key)).toBeNull();
  });

  test("clearDraft is a no-op when key does not exist", () => {
    expect(() => clearDraft("nonexistent_key")).not.toThrow();
  });

  test("loadDraft returns null on malformed JSON", () => {
    const key = "kv_onboarding_draft_bad";
    localStorage.setItem(key, "not-valid-json{{{");
    expect(loadDraft(key)).toBeNull();
  });
});

// ── profileValidFromDraft ─────────────────────────────────────────

describe("profileValidFromDraft", () => {
  test("returns true for complete profile data", () => {
    expect(profileValidFromDraft({
      firstName: "Ian", lastName: "Mwendwa",
      phoneNumber: "+254712345678", timezone: "Africa/Nairobi",
    })).toBe(true);
  });

  test("returns false when firstName too short", () => {
    expect(profileValidFromDraft({
      firstName: "I", lastName: "Mwendwa",
      phoneNumber: "+254712345678", timezone: "UTC",
    })).toBe(false);
  });

  test("returns false when lastName too short", () => {
    expect(profileValidFromDraft({
      firstName: "Ian", lastName: "M",
      phoneNumber: "+254712345678", timezone: "UTC",
    })).toBe(false);
  });

  test("returns false when phoneNumber too short", () => {
    expect(profileValidFromDraft({
      firstName: "Ian", lastName: "Mwendwa",
      phoneNumber: "123", timezone: "UTC",
    })).toBe(false);
  });

  test("returns false when timezone missing", () => {
    expect(profileValidFromDraft({
      firstName: "Ian", lastName: "Mwendwa",
      phoneNumber: "+254712345678", timezone: "",
    })).toBe(false);
  });

  test("returns false for null input", () => {
    expect(profileValidFromDraft(null)).toBe(false);
  });

  test("returns false for undefined input", () => {
    expect(profileValidFromDraft(undefined)).toBe(false);
  });

  test("phoneNumber exactly 5 chars is valid", () => {
    expect(profileValidFromDraft({
      firstName: "Ian", lastName: "Mwendwa",
      phoneNumber: "12345", timezone: "UTC",
    })).toBe(true);
  });
});

// ── canContinue ───────────────────────────────────────────────────

describe("canContinue", () => {
  const base = {
    traderType: null, experienceLevel: null,
    tradingStyles: [], tradingModes: [],
  };

  // Step 1 — trader type selection
  test("step 1 is blocked without traderType", () => {
    expect(canContinue(1, { ...base, experienceLevel: "beginner" }, false)).toBe(false);
  });

  test("step 1 is blocked without experienceLevel", () => {
    expect(canContinue(1, { ...base, traderType: "manual" }, false)).toBe(false);
  });

  test("step 1 passes with traderType and experienceLevel", () => {
    expect(canContinue(1, { traderType: "manual", experienceLevel: "beginner" }, false)).toBe(true);
  });

  test("step 1 passes for each valid traderType", () => {
    for (const t of ["manual", "prop", "ea", "semi-auto"]) {
      expect(canContinue(1, { traderType: t, experienceLevel: "beginner" }, false)).toBe(true);
    }
  });

  // Step 2 — profile validity
  test("step 2 blocked when profileValid is false", () => {
    expect(canContinue(2, base, false)).toBe(false);
  });

  test("step 2 passes when profileValid is true", () => {
    expect(canContinue(2, base, true)).toBe(true);
  });

  // Step 3 — trading styles
  test("step 3 blocked when no trading styles selected", () => {
    expect(canContinue(3, { tradingStyles: [] }, false)).toBe(false);
  });

  test("step 3 passes with at least one style", () => {
    expect(canContinue(3, { tradingStyles: ["intraday"] }, false)).toBe(true);
  });

  test("step 3 passes with multiple styles", () => {
    expect(canContinue(3, { tradingStyles: ["scalping", "swing"] }, false)).toBe(true);
  });

  // Step 4 — preferences (always passable)
  test("step 4 always passes", () => {
    expect(canContinue(4, base, false)).toBe(true);
  });

  // Step 5 — account creation (always passable — has own submit)
  test("step 5 always passes", () => {
    expect(canContinue(5, base, false)).toBe(true);
  });
});

// ── getNextStep (FRONTEND.md resume logic) ────────────────────────

describe("getNextStep", () => {
  test("empty completedSteps → first step is email_verified (email user)", () => {
    expect(getNextStep([])).toBe("email_verified");
  });

  test("email verified → next is profile_setup", () => {
    expect(getNextStep(["email_verified"])).toBe("profile_setup");
  });

  test("profile_setup done → next is preferences_set", () => {
    expect(getNextStep(["email_verified", "profile_setup"])).toBe("preferences_set");
  });

  test("profile + preferences done → next is first_account_created", () => {
    expect(getNextStep(["email_verified", "profile_setup", "preferences_set"]))
      .toBe("first_account_created");
  });

  test("all steps done → returns 'done'", () => {
    expect(getNextStep([
      "email_verified", "profile_setup", "preferences_set", "first_account_created",
    ])).toBe("done");
  });

  test("Google user skips email_verified step — empty → profile_setup", () => {
    expect(getNextStep([], true)).toBe("profile_setup");
  });

  test("Google user with profile done → preferences_set", () => {
    expect(getNextStep(["profile_setup"], true)).toBe("preferences_set");
  });

  test("Google user all done → 'done'", () => {
    expect(getNextStep(["profile_setup", "preferences_set", "first_account_created"], true))
      .toBe("done");
  });

  test("order-independent: completedSteps as set, not array index", () => {
    // profile_setup marked but email_verified not yet — email_verified should be next
    expect(getNextStep(["profile_setup"])).toBe("email_verified");
  });
});

// ── Widget presets ────────────────────────────────────────────────

describe("widgetPresets", () => {
  const widgetPresets = {
    manual:      ["personal_overview", "win_rate", "avg_rr", "streak", "recent_trades", "pair_performance", "balance_history"],
    prop:        ["prop_overview", "prop_challenges", "win_rate", "recent_trades", "balance_history"],
    ea:          ["personal_overview", "win_rate", "recent_trades", "balance_history"],
    "semi-auto": ["personal_overview", "win_rate", "recent_trades", "balance_history"],
  };

  test("manual preset includes pair_performance", () => {
    expect(widgetPresets.manual).toContain("pair_performance");
  });

  test("prop preset includes prop_challenges", () => {
    expect(widgetPresets.prop).toContain("prop_challenges");
  });

  test("prop preset does not include pair_performance", () => {
    expect(widgetPresets.prop).not.toContain("pair_performance");
  });

  test("ea preset uses same widgets as semi-auto", () => {
    expect(widgetPresets.ea).toEqual(widgetPresets["semi-auto"]);
  });

  test("all presets include balance_history", () => {
    for (const preset of Object.values(widgetPresets)) {
      expect(preset).toContain("balance_history");
    }
  });

  test("all presets include win_rate", () => {
    for (const preset of Object.values(widgetPresets)) {
      expect(preset).toContain("win_rate");
    }
  });

  test("manual preset has the most widgets", () => {
    const lengths = Object.values(widgetPresets).map((p) => p.length);
    expect(widgetPresets.manual.length).toBe(Math.max(...lengths));
  });
});
