import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ── Mocks ────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// The axios mock — must use vi.fn() inline (factory is hoisted)
vi.mock("@/lib/axios", () => ({
  default: { post: vi.fn() },
}));

vi.mock("firebase/auth", () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
  getAuth: vi.fn(),
}));

// Firebase module provides auth.currentUser — we use a module-level object
// so tests can mutate emailVerified on it.
vi.mock("@/lib/firebase", () => {
  const user = {
    email: "trader@example.com",
    emailVerified: false,
    getIdToken: vi.fn().mockResolvedValue("mock-id-token"),
    reload: vi.fn().mockResolvedValue(undefined),
  };
  return {
    // Expose the user object on the module so tests can import and mutate it
    _mockUser: user,
    auth: { get currentUser() { return user; } },
  };
});

vi.mock("@/store/useAuthStore", () => {
  const state = {
    mongoUser: { email: "trader@example.com", emailVerified: false },
    firebaseUser: null,
    logout: vi.fn(),
  };
  const fn = vi.fn(() => state);
  fn.getState = vi.fn(() => ({
    mongoUser: state.mongoUser,
    onboardingComplete: true,
    setMongoUser: vi.fn(),
    setOnboardingComplete: vi.fn(),
  }));
  return { useAuthStore: fn };
});

vi.mock("@/components/layouts/AuthLayout", () => ({
  AuthLayout: ({ children }) => <div>{children}</div>,
}));

vi.mock("@/components/shared/Logo", () => ({
  default: () => <div data-testid="logo" />,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/constants/api", () => ({
  API: {
    AUTH: {
      RESEND_VERIFICATION: "/auth/resend-verification",
      VERIFY_EMAIL: "/auth/verify-email",
      LOGIN: "/auth/login",
    },
  },
}));

// ── Static imports after mocks ────────────────────────────────────────
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import api from "@/lib/axios";
import * as firebaseLib from "@/lib/firebase";
import * as firebaseAuth from "firebase/auth";
import { useAuthStore } from "@/store/useAuthStore";
import * as sonner from "sonner";

// ── Helpers ──────────────────────────────────────────────────────────

const getFirebaseUser = () => firebaseLib._mockUser;

const renderPage = () =>
  render(
    <MemoryRouter>
      <VerifyEmailPage />
    </MemoryRouter>
  );

// ── Tests ─────────────────────────────────────────────────────────────

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mutable firebase user state
    const user = getFirebaseUser();
    user.emailVerified = false;
    user.reload = vi.fn().mockResolvedValue(undefined);
    user.getIdToken = vi.fn().mockResolvedValue("mock-id-token");
    vi.mocked(api.post).mockResolvedValue({ success: true });
  });

  test("displays user email in the message", () => {
    renderPage();
    expect(screen.getByText("trader@example.com")).toBeInTheDocument();
  });

  test("resend button calls POST /auth/resend-verification with Bearer token", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /resend verification email/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/auth/resend-verification",
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-id-token",
          }),
        })
      );
    });
  });

  test("shows Sent feedback on 200 response", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ success: true });
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /resend verification email/i }));

    await waitFor(() => {
      expect(screen.getByText(/sent — check your inbox/i)).toBeInTheDocument();
    });
  });

  test("resend button shows countdown and is disabled after success", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ success: true });
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /resend verification email/i }));

    await waitFor(() => {
      expect(screen.getByText(/resend in \d+s/i)).toBeInTheDocument();
    });

    const resendBtn = screen.getByText(/resend in \d+s/i).closest("button");
    expect(resendBtn).toBeDisabled();
  });

  test("shows rate limit message on 429", async () => {
    vi.mocked(api.post).mockRejectedValueOnce({ status: 429, response: { status: 429 } });
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /resend verification email/i }));

    await waitFor(() => {
      expect(screen.getByText(/too many attempts/i)).toBeInTheDocument();
    });
  });

  test("shows already-verified toast and navigates to /login on 400", async () => {
    vi.mocked(api.post).mockRejectedValueOnce({ status: 400, response: { status: 400 } });
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /resend verification email/i }));

    await waitFor(() => {
      expect(sonner.toast.success).toHaveBeenCalledWith(
        expect.stringMatching(/already verified/i)
      );
      expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
    });
  });

  test("Continue button calls user.reload() before checking emailVerified", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /already verified\? continue/i }));

    await waitFor(() => {
      expect(getFirebaseUser().reload).toHaveBeenCalled();
    });
  });

  test("Continue navigates when emailVerified is true after reload", async () => {
    const user = getFirebaseUser();
    user.reload = vi.fn().mockImplementation(async () => {
      user.emailVerified = true;
    });
    vi.mocked(api.post).mockResolvedValue({
      success: true,
      user: { emailVerified: true },
      onboardingComplete: true,
    });
    useAuthStore.getState.mockReturnValue({
      mongoUser: { emailVerified: true },
      onboardingComplete: true,
      setMongoUser: vi.fn(),
      setOnboardingComplete: vi.fn(),
    });

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /already verified\? continue/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/dashboard|onboarding/),
        { replace: true }
      );
    });
  });

  test("Continue shows 'not verified yet' when emailVerified still false after reload", async () => {
    // reload completes but emailVerified stays false — default state
    const user = getFirebaseUser();
    user.emailVerified = false;

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /already verified\? continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/not verified yet/i)).toBeInTheDocument();
    });
  });

  test("Sign out button calls signOut and navigates to /login", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /wrong email\? sign out/i }));

    await waitFor(() => {
      expect(firebaseAuth.signOut).toHaveBeenCalled();
      expect(useAuthStore().logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
    });
  });
});
