import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ─────────────────────────────────────────────────────────

const mockCreateAccount = vi.fn();

vi.mock("@/hooks/useAccounts", () => ({
  useCreateAccount: () => ({ mutate: mockCreateAccount, isPending: false }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    div:    ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => children,
}));

// ── Import after mocks ────────────────────────────────────────────

import { AccountCreationStep } from "@/components/onboarding/AccountCreationStep";

// ── Helpers ───────────────────────────────────────────────────────

const baseWizardData = { traderType: "manual" };

const render$ = (props = {}) =>
  render(
    <AccountCreationStep
      wizardData={baseWizardData}
      onAccountCreated={vi.fn()}
      onSkip={vi.fn()}
      {...props}
    />
  );

// ── Field visibility: normal account ─────────────────────────────

describe("AccountCreationStep — normal account fields", () => {
  beforeEach(() => mockCreateAccount.mockReset());

  test("shows 'Starting Balance' label for normal accounts", () => {
    render$();
    expect(screen.getByText(/Starting Balance/i)).toBeInTheDocument();
  });

  test("shows Trading Mode select for normal accounts", () => {
    render$();
    expect(screen.getByText(/Trading Mode/i)).toBeInTheDocument();
  });

  test("shows Broker field for normal accounts", () => {
    render$();
    expect(screen.getByText(/Broker/i)).toBeInTheDocument();
  });

  test("does NOT show Prop Firm Name for normal accounts", () => {
    render$();
    expect(screen.queryByText(/Prop Firm Name/i)).not.toBeInTheDocument();
  });

  test("does NOT show Program Type for normal accounts", () => {
    render$();
    expect(screen.queryByText(/Program Type/i)).not.toBeInTheDocument();
  });

  test("does NOT show Profit Target for normal accounts", () => {
    render$();
    expect(screen.queryByText(/Profit Target/i)).not.toBeInTheDocument();
  });

  test("does NOT show Daily Drawdown for normal accounts", () => {
    render$();
    expect(screen.queryByText(/Daily Drawdown/i)).not.toBeInTheDocument();
  });
});

// ── Field visibility: prop account ───────────────────────────────

describe("AccountCreationStep — prop account fields", () => {
  const propWizard = { traderType: "prop" };

  test("shows 'Account Size' label for prop accounts", () => {
    render$({ wizardData: propWizard });
    expect(screen.getByText(/Account Size/i)).toBeInTheDocument();
  });

  test("does NOT show 'Starting Balance' label for prop accounts", () => {
    render$({ wizardData: propWizard });
    expect(screen.queryByText(/^Starting Balance/i)).not.toBeInTheDocument();
  });

  test("does NOT show Trading Mode for prop accounts", () => {
    render$({ wizardData: propWizard });
    expect(screen.queryByText(/Trading Mode/i)).not.toBeInTheDocument();
  });

  test("does NOT show Broker field for prop accounts", () => {
    render$({ wizardData: propWizard });
    expect(screen.queryByText(/^Broker/i)).not.toBeInTheDocument();
  });

  test("shows Prop Firm Name field", () => {
    render$({ wizardData: propWizard });
    expect(screen.getByText(/Prop Firm Name/i)).toBeInTheDocument();
  });

  test("shows Program Type dropdown", () => {
    render$({ wizardData: propWizard });
    expect(screen.getByText(/Program Type/i)).toBeInTheDocument();
  });

  test("shows Profit Target % field", () => {
    render$({ wizardData: propWizard });
    expect(screen.getByText(/Profit Target %/i)).toBeInTheDocument();
  });

  test("shows Max Drawdown % field", () => {
    render$({ wizardData: propWizard });
    expect(screen.getByText(/Max Drawdown %/i)).toBeInTheDocument();
  });

  test("shows Daily Drawdown % field", () => {
    render$({ wizardData: propWizard });
    expect(screen.getByText(/Daily Drawdown %/i)).toBeInTheDocument();
  });

  test("shows Min Trading Days field", () => {
    render$({ wizardData: propWizard });
    expect(screen.getByText(/Min Trading Days/i)).toBeInTheDocument();
  });

  test("shows Challenge Fee field", () => {
    render$({ wizardData: propWizard });
    expect(screen.getByText(/Challenge Fee/i)).toBeInTheDocument();
  });
});

// ── EA sync hint ──────────────────────────────────────────────────

describe("AccountCreationStep — EA sync hint", () => {
  test("shows EA sync hint for ea trader type", () => {
    render$({ wizardData: { traderType: "ea" } });
    expect(screen.getByText(/EA Sync/i)).toBeInTheDocument();
  });

  test("shows EA sync hint for semi-auto trader type", () => {
    render$({ wizardData: { traderType: "semi-auto" } });
    expect(screen.getByText(/EA Sync/i)).toBeInTheDocument();
  });

  test("does NOT show EA sync hint for manual trader type", () => {
    render$({ wizardData: { traderType: "manual" } });
    expect(screen.queryByText(/EA Sync/i)).not.toBeInTheDocument();
  });

  test("does NOT show EA sync hint for prop trader type", () => {
    render$({ wizardData: { traderType: "prop" } });
    expect(screen.queryByText(/EA Sync/i)).not.toBeInTheDocument();
  });
});

// ── Skip button ───────────────────────────────────────────────────

describe("AccountCreationStep — skip button", () => {
  test("skip button is rendered", () => {
    render$();
    expect(screen.getByText(/I'll add my account later/i)).toBeInTheDocument();
  });

  test("clicking skip triggers onSkip callback", async () => {
    const onSkip = vi.fn();
    render$({ onSkip });
    await userEvent.click(screen.getByText(/I'll add my account later/i));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  test("onSkip not called before clicking", () => {
    const onSkip = vi.fn();
    render$({ onSkip });
    expect(onSkip).not.toHaveBeenCalled();
  });
});

// ── Submit button states ──────────────────────────────────────────

describe("AccountCreationStep — submit button", () => {
  test("shows 'Create Account & Finish' when not pending", () => {
    render$();
    expect(screen.getByText("Create Account & Finish")).toBeInTheDocument();
  });
});

// ── Subtitle copy based on trader type ───────────────────────────

describe("AccountCreationStep — subtitle", () => {
  test("shows correct subtitle for manual trader", () => {
    render$({ wizardData: { traderType: "manual" } });
    expect(screen.getByText(/start tracking your trades/i)).toBeInTheDocument();
  });

  test("shows correct subtitle for prop trader", () => {
    render$({ wizardData: { traderType: "prop" } });
    expect(screen.getByText(/prop firm challenge/i)).toBeInTheDocument();
  });

  test("shows correct subtitle for ea trader", () => {
    render$({ wizardData: { traderType: "ea" } });
    expect(screen.getByText(/connect your EA/i)).toBeInTheDocument();
  });

  test("shows correct subtitle for semi-auto trader", () => {
    render$({ wizardData: { traderType: "semi-auto" } });
    expect(screen.getByText(/primary trading account/i)).toBeInTheDocument();
  });
});
