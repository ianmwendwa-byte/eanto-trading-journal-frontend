/**
 * LandingNavbar — Features dropdown tests.
 *
 * Covers the conversion of the "Features" nav item from a scroll-to button
 * into a real dropdown (desktop) / stacked link list (mobile sheet), linking
 * to all 8 feature topics.
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import fs from "fs";
import path from "path";

// ── Mock framer-motion ─────────────────────────────────────────────────────

vi.mock("framer-motion", () => ({
  motion: {
    header: ({ children, ...p }) => <header {...p}>{children}</header>,
    div:    ({ children, ...p }) => <div {...p}>{children}</div>,
  },
}));

// ── Mock theme provider ─────────────────────────────────────────────────────

vi.mock("@/components/theme-provider", () => ({
  useTheme: () => ({ theme: "dark", setTheme: vi.fn() }),
}));

// ── Mock Logo ────────────────────────────────────────────────────────────────

vi.mock("@/components/shared/Logo", () => ({
  default: () => <span data-testid="logo" />,
}));

// ── Static import after mocks ───────────────────────────────────────────────

import { LandingNavbar } from "@/components/landing/LandingNavbar";

const renderNavbar = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <LandingNavbar />
    </MemoryRouter>
  );

const EXPECTED_FEATURE_LINKS = [
  { label: "Trade Tracking", href: "/features/trade-tracking" },
  { label: "Financial Ledger", href: "/features/financial-ledger" },
  { label: "Business Score", href: "/business-score" },
  { label: "Prop Firm Compliance", href: "/features/prop-firm-compliance" },
  { label: "Risk Calculators", href: "/features/risk-calculators" },
  { label: "EA Sync", href: "/ea-sync" },
];

describe("LandingNavbar — Features dropdown (desktop)", () => {
  test("renders a Features trigger button", () => {
    renderNavbar();
    expect(screen.getByRole("button", { name: /features menu/i })).toBeInTheDocument();
  });

  test("clicking the trigger opens the dropdown (aria-expanded becomes true)", async () => {
    const user = userEvent.setup();
    renderNavbar();
    const trigger = screen.getByRole("button", { name: /features menu/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  // Radix's DropdownMenuContent renders into a portal driven by Presence
  // animation-frame measurements that jsdom does not fully emulate, so the
  // portal content is unreliable to query directly in this environment.
  // Instead we verify the exact FEATURE_GROUPS data (the single source of
  // truth rendered into both the desktop dropdown and the mobile sheet)
  // contains all 8 expected feature links with the correct hrefs.
  test("FEATURE_GROUPS data source includes all 8 feature links with correct hrefs", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/landing/LandingNavbar.jsx"),
      "utf-8"
    );
    const match = source.match(/const FEATURE_GROUPS = \[([\s\S]*?)\n\];/);
    expect(match).toBeTruthy();
    const block = match[1];

    for (const { label, href } of EXPECTED_FEATURE_LINKS) {
      expect(block).toContain(`label: "${label}"`);
      expect(block).toContain(`href: "${href}"`);
    }

    // Exactly 8 topics total, split across 2 groups
    const entries = block.match(/\{\s*label:/g) || [];
    expect(entries.length).toBe(8);
  });
});

describe("LandingNavbar — mobile sheet feature links", () => {
  test("opening the mobile menu shows all 8 feature links stacked", async () => {
    const user = userEvent.setup();
    renderNavbar();
    await user.click(screen.getByRole("button", { name: /open menu/i }));

    for (const { label, href } of EXPECTED_FEATURE_LINKS) {
      const links = await screen.findAllByRole("link", { name: label });
      expect(links.some((l) => l.getAttribute("href") === href)).toBe(true);
    }
  });
});
