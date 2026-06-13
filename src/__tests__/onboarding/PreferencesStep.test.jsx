import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreferencesStep } from "@/components/onboarding/PreferencesStep";

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock("framer-motion", () => ({
  motion: {
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    div:    ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => children,
}));

// ── Helpers ───────────────────────────────────────────────────────

const baseWizard = {
  agentTone:           "analyst",
  preferredDebriefDay: "sunday",
  emailDigest:         "weekly",
  tradeAlerts:         true,
  drawdownWarnings:    true,
  weeklyDebrief:       true,
  pushEnabled:         false,
};

const render$ = (props = {}) =>
  render(
    <PreferencesStep
      wizardData={baseWizard}
      onChange={vi.fn()}
      {...props}
    />
  );

// ── Rendering ─────────────────────────────────────────────────────

describe("PreferencesStep — rendering", () => {
  test("shows heading 'Customize your experience'", () => {
    render$();
    expect(screen.getByText(/Customize your experience/i)).toBeInTheDocument();
  });

  test("shows all 3 AI tone options", () => {
    render$();
    expect(screen.getByText("Analyst")).toBeInTheDocument();
    expect(screen.getByText("Coach")).toBeInTheDocument();
    expect(screen.getByText("Direct")).toBeInTheDocument();
  });

  test("shows all 7 debrief day buttons", () => {
    render$();
    for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
      expect(screen.getByText(day)).toBeInTheDocument();
    }
  });

  test("shows Trade Alerts toggle", () => {
    render$();
    expect(screen.getByText(/Trade Alerts/i)).toBeInTheDocument();
  });

  test("shows Drawdown Warnings toggle", () => {
    render$();
    expect(screen.getByText(/Drawdown Warnings/i)).toBeInTheDocument();
  });

  test("shows Weekly Debrief toggle", () => {
    render$();
    expect(screen.getAllByText(/Weekly Debrief/i).length).toBeGreaterThanOrEqual(1);
  });

  test("shows Email Digest selector", () => {
    render$();
    expect(screen.getByText(/Email Digest/i)).toBeInTheDocument();
  });
});

// ── Agent tone selection ──────────────────────────────────────────

describe("PreferencesStep — agent tone", () => {
  test("clicking Analyst calls onChange with agentTone: analyst", async () => {
    const onChange = vi.fn();
    render$({ onChange });
    await userEvent.click(screen.getByText("Analyst"));
    expect(onChange).toHaveBeenCalledWith({ agentTone: "analyst" });
  });

  test("clicking Coach calls onChange with agentTone: coach", async () => {
    const onChange = vi.fn();
    render$({ onChange });
    await userEvent.click(screen.getByText("Coach"));
    expect(onChange).toHaveBeenCalledWith({ agentTone: "coach" });
  });

  test("clicking Direct calls onChange with agentTone: direct", async () => {
    const onChange = vi.fn();
    render$({ onChange });
    await userEvent.click(screen.getByText("Direct"));
    expect(onChange).toHaveBeenCalledWith({ agentTone: "direct" });
  });
});

// ── Debrief day selection ─────────────────────────────────────────

describe("PreferencesStep — debrief day", () => {
  test("clicking Mon calls onChange with preferredDebriefDay: monday", async () => {
    const onChange = vi.fn();
    render$({ onChange });
    await userEvent.click(screen.getByText("Mon"));
    expect(onChange).toHaveBeenCalledWith({ preferredDebriefDay: "monday" });
  });

  test("clicking Sun calls onChange with preferredDebriefDay: sunday", async () => {
    const onChange = vi.fn();
    render$({ onChange });
    await userEvent.click(screen.getByText("Sun"));
    expect(onChange).toHaveBeenCalledWith({ preferredDebriefDay: "sunday" });
  });

  test("clicking Fri calls onChange with preferredDebriefDay: friday", async () => {
    const onChange = vi.fn();
    render$({ onChange });
    await userEvent.click(screen.getByText("Fri"));
    expect(onChange).toHaveBeenCalledWith({ preferredDebriefDay: "friday" });
  });
});

// ── Notification toggles ──────────────────────────────────────────
// Switches render as role="switch". They're ordered: tradeAlerts[0],
// drawdownWarnings[1], weeklyDebrief[2].

describe("PreferencesStep — notification toggles", () => {
  test("renders exactly 3 toggle switches", () => {
    render$();
    expect(screen.getAllByRole("switch")).toHaveLength(3);
  });

  test("Trade Alerts switch (index 0) is checked when tradeAlerts is true", () => {
    render$({ wizardData: { ...baseWizard, tradeAlerts: true } });
    expect(screen.getAllByRole("switch")[0]).toBeChecked();
  });

  test("Trade Alerts switch (index 0) is unchecked when tradeAlerts is false", () => {
    render$({ wizardData: { ...baseWizard, tradeAlerts: false } });
    expect(screen.getAllByRole("switch")[0]).not.toBeChecked();
  });

  test("Drawdown Warnings switch (index 1) unchecked when drawdownWarnings is false", () => {
    render$({ wizardData: { ...baseWizard, drawdownWarnings: false } });
    expect(screen.getAllByRole("switch")[1]).not.toBeChecked();
  });

  test("Drawdown Warnings switch (index 1) checked when drawdownWarnings is true", () => {
    render$({ wizardData: { ...baseWizard, drawdownWarnings: true } });
    expect(screen.getAllByRole("switch")[1]).toBeChecked();
  });

  test("Weekly Debrief switch (index 2) unchecked when weeklyDebrief is false", () => {
    render$({ wizardData: { ...baseWizard, weeklyDebrief: false } });
    expect(screen.getAllByRole("switch")[2]).not.toBeChecked();
  });

  test("Weekly Debrief switch (index 2) checked when weeklyDebrief is true", () => {
    render$({ wizardData: { ...baseWizard, weeklyDebrief: true } });
    expect(screen.getAllByRole("switch")[2]).toBeChecked();
  });
});
