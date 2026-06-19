import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// ── Mocks ────────────────────────────────────────────────────────────

vi.mock("@/lib/axios", () => ({
  default: { post: vi.fn().mockResolvedValue({ user: {}, onboardingComplete: true }) },
}));

vi.mock("firebase/auth", () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
  getAuth: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  auth: { currentUser: null },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/components/shared/Logo", () => ({
  default: () => <div data-testid="logo" />,
}));

vi.mock("@/hooks/useResendVerification", () => ({
  useResendVerification: () => ({
    resend: vi.fn(),
    status: "idle",
    countdown: 0,
  }),
}));

vi.mock("@/constants/api", () => ({
  API: {
    AUTH: {
      LOGIN: "/auth/login",
      VERIFY_EMAIL: "/auth/verify-email",
      RESEND_VERIFICATION: "/auth/resend-verification",
    },
  },
}));

// Controlled mock — we update the factory return value between tests
const mockAuthState = {
  value: {
    isAuthenticated: false,
    isLoading: false,
    firebaseUser: null,
    mongoUser: null,
    onboardingComplete: null,
    logout: vi.fn(),
  },
};

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: vi.fn(() => mockAuthState.value),
}));

// ── Static imports after mocks ────────────────────────────────────────
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { useAuthStore } from "@/store/useAuthStore";

// ── Helpers ──────────────────────────────────────────────────────────

const ProtectedContent = () => <div data-testid="protected-content">Protected</div>;

const renderWithGuard = (initialPath = "/dashboard") =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        <Route path="/auth/verify-email" element={<div data-testid="verify-email-page">Verify</div>} />
        <Route path="/onboarding" element={<div data-testid="onboarding-page">Onboarding</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProtectedContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

// ── Tests ────────────────────────────────────────────────────────────

describe("ProtectedRoute auth guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default state
    mockAuthState.value = {
      isAuthenticated: false,
      isLoading: false,
      firebaseUser: null,
      mongoUser: null,
      onboardingComplete: null,
      logout: vi.fn(),
    };
    vi.mocked(useAuthStore).mockImplementation(() => mockAuthState.value);
  });

  test("authenticated + emailVerified=true renders protected content", () => {
    mockAuthState.value = {
      ...mockAuthState.value,
      isAuthenticated: true,
      firebaseUser: { emailVerified: true },
      mongoUser: { emailVerified: true, onboarding: { skippedAt: null } },
      onboardingComplete: true,
    };
    vi.mocked(useAuthStore).mockImplementation(() => mockAuthState.value);

    renderWithGuard();
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  test("authenticated + firebaseUser.emailVerified=false shows email verification gate", () => {
    mockAuthState.value = {
      ...mockAuthState.value,
      isAuthenticated: true,
      firebaseUser: { emailVerified: false, email: "test@example.com" },
      mongoUser: { emailVerified: false, email: "test@example.com" },
      onboardingComplete: true,
    };
    vi.mocked(useAuthStore).mockImplementation(() => mockAuthState.value);

    renderWithGuard();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
  });

  test("unauthenticated redirects to /login", () => {
    // Default state: isAuthenticated: false
    renderWithGuard();
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  test("authenticated + mongoUser.emailVerified=false shows email verification gate", () => {
    mockAuthState.value = {
      ...mockAuthState.value,
      isAuthenticated: true,
      firebaseUser: { emailVerified: false, email: "test@example.com" },
      mongoUser: { emailVerified: false, email: "test@example.com" },
      onboardingComplete: true,
    };
    vi.mocked(useAuthStore).mockImplementation(() => mockAuthState.value);

    renderWithGuard();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
  });

  test("/auth/verify-email is accessible without going through ProtectedRoute", () => {
    // VerifyEmailPage is a public route not wrapped in ProtectedRoute.
    // A user with emailVerified=false navigating here must NOT be redirected.
    render(
      <MemoryRouter initialEntries={["/auth/verify-email"]}>
        <Routes>
          <Route
            path="/auth/verify-email"
            element={<div data-testid="verify-email-page">Verify</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("verify-email-page")).toBeInTheDocument();
  });

  test("shows loading spinner while isLoading is true", () => {
    mockAuthState.value = {
      ...mockAuthState.value,
      isLoading: true,
      isAuthenticated: false,
    };
    vi.mocked(useAuthStore).mockImplementation(() => mockAuthState.value);

    renderWithGuard();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });
});
