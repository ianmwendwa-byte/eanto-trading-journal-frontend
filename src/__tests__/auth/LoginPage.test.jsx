import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// ── Mocks ────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: "/login" }),
  };
});

// NOTE: vi.mock factories are hoisted to top of file — cannot reference outer
// variables. Use vi.fn() inline; retrieve refs via import after mock setup.
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  sendEmailVerification: vi.fn(),
  getAuth: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  auth: {},
  googleProvider: {},
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: vi.fn(() => ({
    mongoUser: null,
    isLoading: false,
  })),
}));

vi.mock("@/lib/firebaseErrors", () => ({
  getFirebaseErrorMessage: (code) => `Firebase error: ${code}`,
}));

vi.mock("@/components/layouts/AuthLayout", () => ({
  AuthLayout: ({ children }) => <div>{children}</div>,
}));

vi.mock("@/components/shared/Logo", () => ({
  default: () => <div data-testid="logo" />,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// ── Static import after mocks ─────────────────────────────────────────
import { Login } from "@/pages/auth/Login";
import * as firebaseAuth from "firebase/auth";
import * as sonner from "sonner";

// ── Helpers ──────────────────────────────────────────────────────────

const renderPage = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

// ── Tests ────────────────────────────────────────────────────────────

describe("Login page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("successful login with emailVerified=true proceeds normally (no verify-email redirect)", async () => {
    vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValueOnce({
      user: { emailVerified: true, email: "trader@example.com" },
    });

    renderPage();
    await userEvent.type(screen.getByLabelText(/email/i), "trader@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalled();
    });

    expect(mockNavigate).not.toHaveBeenCalledWith("/auth/verify-email", expect.anything());
  });

  test("successful login with emailVerified=false navigates to /auth/verify-email", async () => {
    vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValueOnce({
      user: { emailVerified: false, email: "trader@example.com" },
    });

    renderPage();
    await userEvent.type(screen.getByLabelText(/email/i), "trader@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/auth/verify-email", { replace: true });
    });
  });

  test('"Forgot password?" link is present and points to /forgot-password', () => {
    renderPage();
    const link = screen.getByRole("link", { name: /forgot password/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toMatch(/forgot-password/);
  });

  test("does NOT call sendEmailVerification after login", async () => {
    vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValueOnce({
      user: { emailVerified: true, email: "trader@example.com" },
    });

    renderPage();
    await userEvent.type(screen.getByLabelText(/email/i), "trader@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalled();
    });

    expect(firebaseAuth.sendEmailVerification).not.toHaveBeenCalled();
  });

  test("shows Firebase error toast on failed sign-in", async () => {
    vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce({
      code: "auth/wrong-password",
    });

    renderPage();
    await userEvent.type(screen.getByLabelText(/email/i), "trader@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpassword");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(sonner.toast.error).toHaveBeenCalledWith(
        "Firebase error: auth/wrong-password"
      );
    });
  });
});
