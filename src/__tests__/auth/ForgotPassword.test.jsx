import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";

// ── Mocks ────────────────────────────────────────────────────────────

const mockPost = vi.fn();
vi.mock("@/lib/axios", () => ({
  default: { post: (...args) => mockPost(...args) },
}));

// Ensure sendPasswordResetEmail is NOT exported / callable
vi.mock("firebase/auth", () => ({
  sendPasswordResetEmail: vi.fn(() => {
    throw new Error("sendPasswordResetEmail must not be called");
  }),
  getAuth: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  auth: {},
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock("@/lib/animations", () => ({
  fadeVariants: {},
}));

vi.mock("@/components/layouts/AuthLayout", () => ({
  AuthLayout: ({ children }) => <div>{children}</div>,
}));

vi.mock("@/components/shared/Logo", () => ({
  default: () => <div data-testid="logo" />,
}));

// ── Helpers ──────────────────────────────────────────────────────────

const renderPage = () =>
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );

// ── Tests ────────────────────────────────────────────────────────────

describe("ForgotPassword page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("submits email to POST /auth/forgot-password", async () => {
    mockPost.mockResolvedValueOnce({ success: true });
    renderPage();

    await userEvent.type(screen.getByLabelText(/email/i), "trader@example.com");
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/auth/forgot-password",
        { email: "trader@example.com" }
      );
    });
  });

  test("shows success state for any 200 response", async () => {
    mockPost.mockResolvedValueOnce({ success: true });
    renderPage();

    await userEvent.type(screen.getByLabelText(/email/i), "trader@example.com");
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument();
    });
  });

  test("never reveals if email exists in UI text", async () => {
    mockPost.mockResolvedValueOnce({ success: true });
    renderPage();

    await userEvent.type(screen.getByLabelText(/email/i), "nonexistent@example.com");
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/no account/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/not found/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/does not exist/i)).not.toBeInTheDocument();
  });

  test("shows same success state even when backend returns 4xx", async () => {
    mockPost.mockRejectedValueOnce({ response: { status: 404 }, message: "Not found" });
    renderPage();

    await userEvent.type(screen.getByLabelText(/email/i), "unknown@example.com");
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument();
    });
  });

  test("shows error state on network failure only (no response)", async () => {
    // Simulate a true network failure — err.response is absent
    mockPost.mockRejectedValueOnce({ message: "Network Error" });
    renderPage();

    await userEvent.type(screen.getByLabelText(/email/i), "trader@example.com");
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    // Form must remain visible for retry
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  test("does NOT call sendPasswordResetEmail Firebase client function", async () => {
    const { sendPasswordResetEmail } = await import("firebase/auth");
    mockPost.mockResolvedValueOnce({ success: true });
    renderPage();

    await userEvent.type(screen.getByLabelText(/email/i), "trader@example.com");
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
    });

    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  test("submit button is disabled while loading", async () => {
    // Keep the promise pending so we can check the disabled state
    let resolvePost;
    mockPost.mockReturnValueOnce(new Promise((r) => { resolvePost = r; }));
    renderPage();

    await userEvent.type(screen.getByLabelText(/email/i), "trader@example.com");

    // Wrap the click+assert in waitFor so React has time to call setLoading(true)
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));
    });

    await waitFor(() => {
      // Button must be disabled once loading starts
      const btn = screen.getByRole("button", { name: /send/i });
      expect(btn).toBeDisabled();
    });

    // Resolve to avoid dangling promises / act warnings
    resolvePost({ success: true });
  });
});
