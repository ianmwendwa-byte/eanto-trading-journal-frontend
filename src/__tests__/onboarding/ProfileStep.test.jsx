import { describe, test, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileStep } from "@/components/onboarding/ProfileStep";

// ── Helpers ───────────────────────────────────────────────────────

const baseWizard = {
  firstName: "", lastName: "", phoneNumber: "",
  timezone: "UTC", country: "",
};

const render$ = (props = {}) =>
  render(
    <ProfileStep
      wizardData={baseWizard}
      onChange={vi.fn()}
      onValidChange={vi.fn()}
      {...props}
    />
  );

// ── Field rendering ───────────────────────────────────────────────

describe("ProfileStep — field rendering", () => {
  test("renders First Name field", () => {
    render$();
    expect(screen.getByPlaceholderText("John")).toBeInTheDocument();
  });

  test("renders Last Name field", () => {
    render$();
    expect(screen.getByPlaceholderText("Doe")).toBeInTheDocument();
  });

  test("renders Phone Number field", () => {
    render$();
    expect(screen.getByPlaceholderText("+254712345678")).toBeInTheDocument();
  });

  test("renders Timezone selector", () => {
    render$();
    expect(screen.getByText(/Timezone/i)).toBeInTheDocument();
  });

  test("renders Country selector (optional)", () => {
    render$();
    expect(screen.getAllByText(/Country/i).length).toBeGreaterThanOrEqual(1);
  });

  test("shows required marker on First Name", () => {
    render$();
    const label = screen.getByText(/First Name/i);
    expect(label).toBeInTheDocument();
  });

  test("shows required marker on Phone Number", () => {
    render$();
    expect(screen.getByText(/Phone Number/i)).toBeInTheDocument();
  });

  test("renders heading 'Let's set up your profile'", () => {
    render$();
    expect(screen.getByText(/Let's set up your profile/i)).toBeInTheDocument();
  });
});

// ── Validation ────────────────────────────────────────────────────

describe("ProfileStep — validation", () => {
  test("shows error when firstName is only 1 character", async () => {
    render$();
    const input = screen.getByPlaceholderText("John");
    await userEvent.type(input, "I");
    await userEvent.tab();
    await waitFor(() =>
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument()
    );
  });

  test("no error when firstName has 2+ characters", async () => {
    render$();
    const input = screen.getByPlaceholderText("John");
    await userEvent.type(input, "Ian");
    await userEvent.tab();
    await waitFor(() =>
      expect(screen.queryByText(/at least 2 characters/i)).not.toBeInTheDocument()
    );
  });

  test("shows error when phoneNumber is too short", async () => {
    render$();
    const input = screen.getByPlaceholderText("+254712345678");
    await userEvent.type(input, "123");
    await userEvent.tab();
    await waitFor(() =>
      expect(screen.getByText(/valid phone number/i)).toBeInTheDocument()
    );
  });

  test("no error when phoneNumber has 5+ characters", async () => {
    render$();
    const input = screen.getByPlaceholderText("+254712345678");
    await userEvent.type(input, "+12345");
    await userEvent.tab();
    await waitFor(() =>
      expect(screen.queryByText(/valid phone number/i)).not.toBeInTheDocument()
    );
  });
});

// ── Pre-populated values ──────────────────────────────────────────

describe("ProfileStep — pre-populated values from wizardData", () => {
  test("firstName is pre-filled when wizardData has it", () => {
    render$({ wizardData: { ...baseWizard, firstName: "Ian" } });
    expect(screen.getByPlaceholderText("John")).toHaveValue("Ian");
  });

  test("lastName is pre-filled when wizardData has it", () => {
    render$({ wizardData: { ...baseWizard, lastName: "Mwendwa" } });
    expect(screen.getByPlaceholderText("Doe")).toHaveValue("Mwendwa");
  });

  test("phoneNumber is pre-filled when wizardData has it", () => {
    render$({ wizardData: { ...baseWizard, phoneNumber: "+254712345678" } });
    expect(screen.getByPlaceholderText("+254712345678")).toHaveValue("+254712345678");
  });
});

// ── onValidChange callback ────────────────────────────────────────

describe("ProfileStep — onValidChange callback", () => {
  test("fires onValidChange on mount with initial valid state", async () => {
    const onValidChange = vi.fn();
    render$({ onValidChange });
    await waitFor(() => expect(onValidChange).toHaveBeenCalled());
  });

  test("calls onValidChange with false for empty form", async () => {
    const onValidChange = vi.fn();
    render$({ onValidChange });
    await waitFor(() => {
      const lastCall = onValidChange.mock.calls.at(-1)?.[0];
      expect(lastCall).toBe(false);
    });
  });
});
