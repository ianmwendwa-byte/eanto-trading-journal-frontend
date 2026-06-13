import { describe, test, expect } from "vitest";
import {
  mapTraderTypeToModes,
  buildOnboardingPayload,
} from "@/hooks/useOnboarding";

// ── mapTraderTypeToModes ──────────────────────────────────────────

describe("mapTraderTypeToModes", () => {
  test("manual → ['manual']", () => {
    expect(mapTraderTypeToModes("manual")).toEqual(["manual"]);
  });

  test("prop → ['manual'] (prop traders trade manually)", () => {
    expect(mapTraderTypeToModes("prop")).toEqual(["manual"]);
  });

  test("ea → ['ea']", () => {
    expect(mapTraderTypeToModes("ea")).toEqual(["ea"]);
  });

  test("semi-auto → ['manual', 'ea']", () => {
    expect(mapTraderTypeToModes("semi-auto")).toEqual(["manual", "ea"]);
  });

  test("unknown value → defaults to ['manual']", () => {
    expect(mapTraderTypeToModes("unknown")).toEqual(["manual"]);
  });

  test("undefined → defaults to ['manual']", () => {
    expect(mapTraderTypeToModes(undefined)).toEqual(["manual"]);
  });

  test("null → defaults to ['manual']", () => {
    expect(mapTraderTypeToModes(null)).toEqual(["manual"]);
  });

  test("empty string → defaults to ['manual']", () => {
    expect(mapTraderTypeToModes("")).toEqual(["manual"]);
  });
});

// ── buildOnboardingPayload ────────────────────────────────────────

const BASE_WIZARD = {
  traderType:          "manual",
  experienceLevel:     "intermediate",
  tradingModes:        ["manual"],
  tradingStyles:       ["intraday", "swing"],
  primaryPairs:        ["EURUSD", "GBPUSD"],
  preferredSessions:   ["london"],
  bio:                 "Intraday trader, 3 years",
  firstName:           "Ian",
  lastName:            "Mwendwa",
  phoneNumber:         "+254712345678",
  timezone:            "Africa/Nairobi",
  country:             "KE",
  emailDigest:         "weekly",
  tradeAlerts:         true,
  drawdownWarnings:    true,
  weeklyDebrief:       true,
  pushEnabled:         false,
  agentTone:           "analyst",
  preferredDebriefDay: "sunday",
};

describe("buildOnboardingPayload — required fields", () => {
  test("includes firstName", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).firstName).toBe("Ian");
  });

  test("includes lastName", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).lastName).toBe("Mwendwa");
  });

  test("includes phoneNumber", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).phoneNumber).toBe("+254712345678");
  });

  test("includes timezone", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).timezone).toBe("Africa/Nairobi");
  });

  test("includes tradingStyles array", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).tradingStyles).toEqual(["intraday", "swing"]);
  });

  test("derives tradingModes from traderType via mapTraderTypeToModes", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).tradingModes).toEqual(["manual"]);
  });

  test("ea traderType → tradingModes=['ea']", () => {
    expect(buildOnboardingPayload({ ...BASE_WIZARD, traderType: "ea" }).tradingModes).toEqual(["ea"]);
  });

  test("semi-auto traderType → tradingModes=['manual','ea']", () => {
    expect(buildOnboardingPayload({ ...BASE_WIZARD, traderType: "semi-auto" }).tradingModes)
      .toEqual(["manual", "ea"]);
  });
});

describe("buildOnboardingPayload — optional fields", () => {
  test("includes primaryPairs when provided", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).primaryPairs).toEqual(["EURUSD", "GBPUSD"]);
  });

  test("includes preferredSessions when provided", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).preferredSessions).toEqual(["london"]);
  });

  test("includes bio when provided", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).bio).toBe("Intraday trader, 3 years");
  });

  test("bio omitted when empty string", () => {
    const payload = buildOnboardingPayload({ ...BASE_WIZARD, bio: "" });
    expect(payload.bio).toBeUndefined();
  });

  test("country omitted when empty string", () => {
    const payload = buildOnboardingPayload({ ...BASE_WIZARD, country: "" });
    expect(payload.country).toBeUndefined();
  });

  test("country included when provided", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).country).toBe("KE");
  });

  test("primaryPairs defaults to [] when missing", () => {
    const payload = buildOnboardingPayload({ ...BASE_WIZARD, primaryPairs: undefined });
    expect(payload.primaryPairs).toEqual([]);
  });

  test("preferredSessions defaults to [] when missing", () => {
    const payload = buildOnboardingPayload({ ...BASE_WIZARD, preferredSessions: undefined });
    expect(payload.preferredSessions).toEqual([]);
  });
});

describe("buildOnboardingPayload — AI preferences", () => {
  test("includes agentTone", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).agentTone).toBe("analyst");
  });

  test("agentTone defaults to 'analyst' when missing", () => {
    const payload = buildOnboardingPayload({ ...BASE_WIZARD, agentTone: undefined });
    expect(payload.agentTone).toBe("analyst");
  });

  test("includes preferredDebriefDay", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).preferredDebriefDay).toBe("sunday");
  });

  test("preferredDebriefDay defaults to 'sunday' when missing", () => {
    const payload = buildOnboardingPayload({ ...BASE_WIZARD, preferredDebriefDay: undefined });
    expect(payload.preferredDebriefDay).toBe("sunday");
  });

  test("weeklyDebriefEnabled is true when weeklyDebrief is true", () => {
    expect(buildOnboardingPayload({ ...BASE_WIZARD, weeklyDebrief: true }).weeklyDebriefEnabled)
      .toBe(true);
  });

  test("weeklyDebriefEnabled is false when weeklyDebrief is false", () => {
    expect(buildOnboardingPayload({ ...BASE_WIZARD, weeklyDebrief: false }).weeklyDebriefEnabled)
      .toBe(false);
  });

  test("journalingAgentEnabled is always true", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).journalingAgentEnabled).toBe(true);
  });

  test("behaviouralAgentEnabled is always true", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).behaviouralAgentEnabled).toBe(true);
  });
});

describe("buildOnboardingPayload — notification preferences", () => {
  test("includes emailDigest", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).emailDigest).toBe("weekly");
  });

  test("emailDigest defaults to 'weekly' when missing", () => {
    const payload = buildOnboardingPayload({ ...BASE_WIZARD, emailDigest: undefined });
    expect(payload.emailDigest).toBe("weekly");
  });

  test("tradeAlerts true stays true", () => {
    expect(buildOnboardingPayload({ ...BASE_WIZARD, tradeAlerts: true }).tradeAlerts).toBe(true);
  });

  test("tradeAlerts false stays false", () => {
    expect(buildOnboardingPayload({ ...BASE_WIZARD, tradeAlerts: false }).tradeAlerts).toBe(false);
  });

  test("drawdownWarnings true stays true", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).drawdownWarnings).toBe(true);
  });

  test("pushEnabled false stays false", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).pushEnabled).toBe(false);
  });

  test("pushEnabled true stays true", () => {
    expect(buildOnboardingPayload({ ...BASE_WIZARD, pushEnabled: true }).pushEnabled).toBe(true);
  });

  test("tradeAlerts defaults to true when undefined", () => {
    const payload = buildOnboardingPayload({ ...BASE_WIZARD, tradeAlerts: undefined });
    expect(payload.tradeAlerts).toBe(true);
  });

  test("pushEnabled defaults to false when undefined", () => {
    const payload = buildOnboardingPayload({ ...BASE_WIZARD, pushEnabled: undefined });
    expect(payload.pushEnabled).toBe(false);
  });
});

describe("buildOnboardingPayload — experienceLevel", () => {
  test("includes experienceLevel", () => {
    expect(buildOnboardingPayload(BASE_WIZARD).experienceLevel).toBe("intermediate");
  });

  test("defaults to 'beginner' when missing", () => {
    const payload = buildOnboardingPayload({ ...BASE_WIZARD, experienceLevel: undefined });
    expect(payload.experienceLevel).toBe("beginner");
  });
});
