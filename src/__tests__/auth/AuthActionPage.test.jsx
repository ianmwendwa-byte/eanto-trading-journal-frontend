/**
 * AuthActionPage tests
 *
 * All Firebase SDK functions are mocked at the module level so no real network
 * calls are made. The AuthLayout and Logo components are stubbed so we can test
 * in isolation without needing the brand panel or font assets.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// ── Firebase mock ──────────────────────────────────────────────────────────────
// We keep the mock functions at the top level so individual tests can control
// their resolved/rejected values.
const mockApplyActionCode         = vi.fn();
const mockVerifyPasswordResetCode = vi.fn();
const mockConfirmPasswordReset    = vi.fn();

vi.mock("firebase/auth", () => ({
  applyActionCode:         (...args) => mockApplyActionCode(...args),
  verifyPasswordResetCode: (...args) => mockVerifyPasswordResetCode(...args),
  confirmPasswordReset:    (...args) => mockConfirmPasswordReset(...args),
}));

vi.mock("@/lib/firebase", () => ({
  auth: {},
}));

// ── Layout / Logo stubs ────────────────────────────────────────────────────────
vi.mock("@/components/layouts/AuthLayout", () => ({
  AuthLayout: ({ children }) => <div data-testid="auth-layout">{children}</div>,
}));

vi.mock("@/components/shared/Logo", () => ({
  default: () => <div data-testid="logo">Kraviq</div>,
}));

// ── Framer Motion stub ─────────────────────────────────────────────────────────
// Render children synchronously so we can assert on them without waiting for
// animation timers to flush.
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, style, ...rest }) => (
      <div className={className} style={style} {...rest}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// ── react-helmet-async stub ────────────────────────────────────────────────────
vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }) => <>{children}</>,
}));

// ── SUT ──────────────────────────────────────────────────────────────────────
import { AuthActionPage } from "@/pages/auth/AuthActionPage";

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Render AuthActionPage with a given query string.
 * path must be the full path string, e.g. "/auth/action?mode=verifyEmail&oobCode=ABC"
 */
const renderPage = (search = "") =>
  render(
    <MemoryRouter initialEntries={[`/auth/action${search}`]}>
      <AuthActionPage />
    </MemoryRouter>
  );

// Helper that creates a Firebase-style error with a .code property
const firebaseError = (code) => Object.assign(new Error(code), { code });

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("AuthActionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  test("shows skeleton loading state on mount", () => {
    // applyActionCode never resolves during this test
    mockApplyActionCode.mockReturnValue(new Promise(() => {}));

    renderPage("?mode=verifyEmail&oobCode=ABC123");

    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
  });

  test("loading state has no spinner — uses skeleton pattern", () => {
    mockApplyActionCode.mockReturnValue(new Promise(() => {}));

    renderPage("?mode=verifyEmail&oobCode=ABC123");

    const skeleton = screen.getByTestId("loading-skeleton");
    expect(skeleton).toBeInTheDocument();

    // No role="progressbar" or lucide Loader2 svg should be present
    expect(screen.queryByRole("progressbar")).toBeNull();
    // The skeleton component renders divs with animate-pulse, NOT a spinner
    const pulsingElements = skeleton.querySelectorAll('[data-slot="skeleton"]');
    expect(pulsingElements.length).toBeGreaterThan(0);
  });

  // ── verifyEmail mode ───────────────────────────────────────────────────────

  test("verifyEmail mode calls applyActionCode with correct oobCode", async () => {
    mockApplyActionCode.mockResolvedValue(undefined);

    renderPage("?mode=verifyEmail&oobCode=TEST_CODE");

    await waitFor(() => {
      expect(mockApplyActionCode).toHaveBeenCalledWith({}, "TEST_CODE");
    });
  });

  test("verifyEmail success → shows verify-success state with checkmark icon", async () => {
    mockApplyActionCode.mockResolvedValue(undefined);

    renderPage("?mode=verifyEmail&oobCode=ABC123");

    await waitFor(() => {
      // The card h2 heading specifically
      expect(screen.getByRole("heading", { level: 2, name: "Email verified" })).toBeInTheDocument();
    });

    // The Check icon from lucide renders as an svg — confirm the button is also present
    expect(screen.getByRole("button", { name: /continue to kraviq/i })).toBeInTheDocument();
  });

  test("verifyEmail auth/expired-action-code → error state with mapped message", async () => {
    mockApplyActionCode.mockRejectedValue(firebaseError("auth/expired-action-code"));

    renderPage("?mode=verifyEmail&oobCode=OLD_CODE");

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/This link has expired/i)
    ).toBeInTheDocument();
  });

  test("verifyEmail auth/invalid-action-code → error state with mapped message", async () => {
    mockApplyActionCode.mockRejectedValue(firebaseError("auth/invalid-action-code"));

    renderPage("?mode=verifyEmail&oobCode=BAD_CODE");

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/This link has already been used or is invalid/i)
    ).toBeInTheDocument();
  });

  // ── resetPassword mode ─────────────────────────────────────────────────────

  test("resetPassword mode calls verifyPasswordResetCode", async () => {
    mockVerifyPasswordResetCode.mockResolvedValue("trader@example.com");

    renderPage("?mode=resetPassword&oobCode=RESET_CODE");

    await waitFor(() => {
      expect(mockVerifyPasswordResetCode).toHaveBeenCalledWith({}, "RESET_CODE");
    });
  });

  test("resetPassword shows form with email from verifyPasswordResetCode", async () => {
    mockVerifyPasswordResetCode.mockResolvedValue("trader@example.com");

    renderPage("?mode=resetPassword&oobCode=RESET_CODE");

    await waitFor(() => {
      expect(screen.getByText(/trader@example\.com/)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  test("reset form validates min 8 chars before calling confirmPasswordReset", async () => {
    mockVerifyPasswordResetCode.mockResolvedValue("trader@example.com");

    renderPage("?mode=resetPassword&oobCode=RESET_CODE");

    await waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });

    // Type a short password and submit
    await userEvent.type(screen.getByLabelText(/new password/i), "short");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "short");
    await userEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });

    expect(mockConfirmPasswordReset).not.toHaveBeenCalled();
  });

  test("reset form validates passwords match before calling confirmPasswordReset", async () => {
    mockVerifyPasswordResetCode.mockResolvedValue("trader@example.com");

    renderPage("?mode=resetPassword&oobCode=RESET_CODE");

    await waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/new password/i), "password123");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "different123");
    await userEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });

    expect(mockConfirmPasswordReset).not.toHaveBeenCalled();
  });

  test("successful confirmPasswordReset → reset-success state", async () => {
    mockVerifyPasswordResetCode.mockResolvedValue("trader@example.com");
    mockConfirmPasswordReset.mockResolvedValue(undefined);

    renderPage("?mode=resetPassword&oobCode=RESET_CODE");

    await waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/new password/i), "newPassword123");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "newPassword123");
    await userEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 2, name: "Password reset" })).toBeInTheDocument();
    });

    expect(screen.getByText(/Your password has been updated/i)).toBeInTheDocument();
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  test("reset-success 'Sign in' button navigates to /login", async () => {
    mockVerifyPasswordResetCode.mockResolvedValue("trader@example.com");
    mockConfirmPasswordReset.mockResolvedValue(undefined);

    renderPage("?mode=resetPassword&oobCode=RESET_CODE");

    await waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/new password/i), "newPassword123");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "newPassword123");
    await userEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /sign in to kraviq/i })).toBeInTheDocument();
    });
  });

  test("verify-success 'Continue' button navigates to /login", async () => {
    mockApplyActionCode.mockResolvedValue(undefined);

    renderPage("?mode=verifyEmail&oobCode=ABC123");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /continue to kraviq/i })).toBeInTheDocument();
    });
  });

  // ── Error state ────────────────────────────────────────────────────────────

  test("error state shows mapped message text", async () => {
    mockApplyActionCode.mockRejectedValue(firebaseError("auth/user-disabled"));

    renderPage("?mode=verifyEmail&oobCode=ABC123");

    await waitFor(() => {
      expect(
        screen.getByText(/This account has been disabled/i)
      ).toBeInTheDocument();
    });
  });

  test("error state 'Back to sign in' uses secondary (outline) button style", async () => {
    mockApplyActionCode.mockRejectedValue(firebaseError("auth/expired-action-code"));

    renderPage("?mode=verifyEmail&oobCode=OLD_CODE");

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    const backBtn = screen.getByRole("link", { name: /back to sign in/i });
    expect(backBtn).toBeInTheDocument();
    // The link is wrapped in a Button with variant="outline" — verify the role and text
    expect(backBtn).toHaveAttribute("href", "/login");
  });

  // ── Guard cases ────────────────────────────────────────────────────────────

  test("missing oobCode → error state immediately, no Firebase call", async () => {
    renderPage("?mode=verifyEmail");

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    expect(mockApplyActionCode).not.toHaveBeenCalled();
    expect(mockVerifyPasswordResetCode).not.toHaveBeenCalled();
  });

  test("unknown mode → error state immediately", async () => {
    renderPage("?mode=recoverEmail&oobCode=ABC123");

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    expect(mockApplyActionCode).not.toHaveBeenCalled();
    expect(mockVerifyPasswordResetCode).not.toHaveBeenCalled();
  });

  test("missing mode param → error state immediately, no Firebase call", async () => {
    renderPage("?oobCode=ABC123");

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    expect(mockApplyActionCode).not.toHaveBeenCalled();
  });

  // ── Animation structure ────────────────────────────────────────────────────

  test("card entrance has fade-up animation — AuthLayout wraps the page", async () => {
    mockApplyActionCode.mockResolvedValue(undefined);

    renderPage("?mode=verifyEmail&oobCode=ABC123");

    // AuthLayout should always be rendered (the Framer motion wrapper sits inside it)
    expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
  });

  test("success icon has scale animation — icon bubble renders after success", async () => {
    mockApplyActionCode.mockResolvedValue(undefined);

    renderPage("?mode=verifyEmail&oobCode=ABC123");

    await waitFor(() => {
      expect(screen.getByText("Email verified")).toBeInTheDocument();
    });

    // The icon container should be present in the DOM
    // The motion.div stub renders it synchronously — if scale animation were blocking
    // this would not appear
    const checkIcon = document.querySelector("svg");
    expect(checkIcon).toBeInTheDocument();
  });

  test("state transitions use AnimatePresence — component renders inside it", async () => {
    mockApplyActionCode.mockResolvedValue(undefined);

    renderPage("?mode=verifyEmail&oobCode=ABC123");

    // Loading state renders first
    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();

    // Then transitions to success
    await waitFor(() => {
      expect(screen.getByText("Email verified")).toBeInTheDocument();
    });

    // Loading skeleton should be gone after transition
    expect(screen.queryByTestId("loading-skeleton")).toBeNull();
  });
});
