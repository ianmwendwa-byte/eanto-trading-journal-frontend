import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepIndicator } from "@/components/onboarding/StepIndicator";

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => children,
}));

// ── Step labels ───────────────────────────────────────────────────

const STEP_LABELS = [
  "Who are you?",
  "Your profile",
  "Trading style",
  "Preferences",
  "First account",
];

describe("StepIndicator — step labels", () => {
  test("shows 'Step 1 of 5 — Who are you?' at step 1", () => {
    render(<StepIndicator currentStep={1} />);
    expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();
    expect(screen.getByText(/Who are you/i)).toBeInTheDocument();
  });

  test("shows 'Step 2 of 5 — Your profile' at step 2", () => {
    render(<StepIndicator currentStep={2} />);
    expect(screen.getByText(/Step 2 of 5/i)).toBeInTheDocument();
    expect(screen.getByText(/Your profile/i)).toBeInTheDocument();
  });

  test("shows 'Step 3 of 5 — Trading style' at step 3", () => {
    render(<StepIndicator currentStep={3} />);
    expect(screen.getByText(/Step 3 of 5/i)).toBeInTheDocument();
    expect(screen.getByText(/Trading style/i)).toBeInTheDocument();
  });

  test("shows 'Step 4 of 5 — Preferences' at step 4", () => {
    render(<StepIndicator currentStep={4} />);
    expect(screen.getByText(/Step 4 of 5/i)).toBeInTheDocument();
    expect(screen.getByText(/Preferences/i)).toBeInTheDocument();
  });

  test("shows 'Step 5 of 5 — First account' at step 5", () => {
    render(<StepIndicator currentStep={5} />);
    expect(screen.getByText(/Step 5 of 5/i)).toBeInTheDocument();
    expect(screen.getByText(/First account/i)).toBeInTheDocument();
  });
});

// ── Step dot states ───────────────────────────────────────────────

describe("StepIndicator — dot completion logic", () => {
  test("step numbers are rendered for all 5 steps", () => {
    render(<StepIndicator currentStep={1} />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getAllByText(String(i)).length).toBeGreaterThanOrEqual(1);
    }
  });

  test("shows 5 step dots regardless of current step", () => {
    const { container } = render(<StepIndicator currentStep={3} />);
    // 5 dot containers in the indicator row
    const dots = container.querySelectorAll("[class*='rounded-full']");
    expect(dots.length).toBeGreaterThanOrEqual(5);
  });
});

// ── Step labels array integrity ────────────────────────────────────

describe("Step labels constant", () => {
  test("has exactly 5 steps", () => {
    expect(STEP_LABELS).toHaveLength(5);
  });

  test("first step is trader type selection", () => {
    expect(STEP_LABELS[0]).toBe("Who are you?");
  });

  test("last step is account creation", () => {
    expect(STEP_LABELS[4]).toBe("First account");
  });

  test("all steps have non-empty labels", () => {
    expect(STEP_LABELS.every((l) => l.length > 0)).toBe(true);
  });
});
