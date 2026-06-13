import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TradingStyleStep } from "@/components/onboarding/TradingStyleStep";

// ── Helpers ───────────────────────────────────────────────────────

const baseWizard = {
  traderType: "manual", tradingStyles: [],
  primaryPairs: [], preferredSessions: [], bio: "",
};

const render$ = (props = {}) =>
  render(
    <TradingStyleStep
      wizardData={baseWizard}
      onChange={vi.fn()}
      {...props}
    />
  );

// ── Rendering ─────────────────────────────────────────────────────

describe("TradingStyleStep — rendering", () => {
  test("shows heading 'How do you trade?'", () => {
    render$();
    expect(screen.getByText(/How do you trade/i)).toBeInTheDocument();
  });

  test("shows all 4 trading style chips", () => {
    render$();
    expect(screen.getByText("Scalping")).toBeInTheDocument();
    expect(screen.getByText("Intraday")).toBeInTheDocument();
    expect(screen.getByText("Swing")).toBeInTheDocument();
    expect(screen.getByText("Position")).toBeInTheDocument();
  });

  test("shows all 4 session buttons", () => {
    render$();
    expect(screen.getByText("Sydney")).toBeInTheDocument();
    expect(screen.getByText("Tokyo")).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();
    expect(screen.getByText("New York")).toBeInTheDocument();
  });

  test("shows pair count display", () => {
    render$();
    expect(screen.getByText("0/10")).toBeInTheDocument();
  });

  test("shows bio textarea", () => {
    render$();
    expect(screen.getByPlaceholderText(/Brief description/i)).toBeInTheDocument();
  });
});

// ── Trading style toggles ─────────────────────────────────────────

describe("TradingStyleStep — style toggles", () => {
  test("clicking a style calls onChange with that style added", async () => {
    const onChange = vi.fn();
    render$({ onChange });
    await userEvent.click(screen.getByText("Intraday"));
    expect(onChange).toHaveBeenCalledWith({ tradingStyles: ["intraday"] });
  });

  test("clicking a selected style removes it", async () => {
    const onChange = vi.fn();
    render$({
      wizardData: { ...baseWizard, tradingStyles: ["intraday"] },
      onChange,
    });
    await userEvent.click(screen.getByText("Intraday"));
    expect(onChange).toHaveBeenCalledWith({ tradingStyles: [] });
  });

  test("can select multiple styles", async () => {
    let currentStyles = [];
    const onChange = vi.fn((updates) => { currentStyles = updates.tradingStyles; });

    const { rerender } = render(<TradingStyleStep
      wizardData={{ ...baseWizard, tradingStyles: currentStyles }}
      onChange={onChange}
    />);

    await userEvent.click(screen.getByText("Scalping"));
    rerender(<TradingStyleStep
      wizardData={{ ...baseWizard, tradingStyles: ["scalping"] }}
      onChange={onChange}
    />);
    await userEvent.click(screen.getByText("Swing"));
    expect(onChange).toHaveBeenCalledWith({ tradingStyles: ["scalping", "swing"] });
  });
});

// ── Pair selection ────────────────────────────────────────────────

describe("TradingStyleStep — pair selection", () => {
  test("clicking a pair calls onChange with it added", async () => {
    const onChange = vi.fn();
    render$({ onChange });
    await userEvent.click(screen.getByText("EURUSD"));
    expect(onChange).toHaveBeenCalledWith({ primaryPairs: ["EURUSD"] });
  });

  test("clicking a selected pair removes it", async () => {
    const onChange = vi.fn();
    render$({
      wizardData: { ...baseWizard, primaryPairs: ["EURUSD"] },
      onChange,
    });
    await userEvent.click(screen.getByText("EURUSD"));
    expect(onChange).toHaveBeenCalledWith({ primaryPairs: [] });
  });

  test("cannot add more than 10 pairs", async () => {
    const tenPairs = ["EURUSD","GBPUSD","USDJPY","AUDUSD","USDCAD",
                      "USDCHF","NZDUSD","EURGBP","GBPJPY","EURJPY"];
    const onChange = vi.fn();
    render$({
      wizardData: { ...baseWizard, primaryPairs: tenPairs },
      onChange,
    });
    await userEvent.click(screen.getByText("XAUUSD"));
    // onChange is called but with the same 10 pairs (max enforced)
    expect(onChange).toHaveBeenCalledWith({ primaryPairs: tenPairs });
  });

  test("pair count shows correctly when pairs are selected", () => {
    render$({
      wizardData: { ...baseWizard, primaryPairs: ["EURUSD", "GBPUSD"] },
    });
    expect(screen.getByText("2/10")).toBeInTheDocument();
  });
});

// ── Session selection ─────────────────────────────────────────────

describe("TradingStyleStep — session selection", () => {
  test("clicking a session calls onChange with it added", async () => {
    const onChange = vi.fn();
    render$({ onChange });
    await userEvent.click(screen.getByText("London"));
    expect(onChange).toHaveBeenCalledWith({ preferredSessions: ["london"] });
  });

  test("clicking a selected session removes it", async () => {
    const onChange = vi.fn();
    render$({
      wizardData: { ...baseWizard, preferredSessions: ["london"] },
      onChange,
    });
    await userEvent.click(screen.getByText("London"));
    expect(onChange).toHaveBeenCalledWith({ preferredSessions: [] });
  });
});

// ── Bio textarea ──────────────────────────────────────────────────

describe("TradingStyleStep — bio", () => {
  test("typing in bio calls onChange with updated bio", () => {
    const onChange = vi.fn();
    render$({ onChange });
    fireEvent.change(screen.getByPlaceholderText(/Brief description/i), {
      target: { value: "Swing trader" },
    });
    expect(onChange).toHaveBeenCalledWith({ bio: "Swing trader" });
  });

  test("bio is pre-filled from wizardData", () => {
    render$({ wizardData: { ...baseWizard, bio: "Scalper at heart" } });
    expect(screen.getByPlaceholderText(/Brief description/i)).toHaveValue("Scalper at heart");
  });

  test("bio counter shows correct length", () => {
    render$({ wizardData: { ...baseWizard, bio: "Hello" } });
    expect(screen.getByText("5/500")).toBeInTheDocument();
  });

  test("bio counter shows 0/500 for empty bio", () => {
    render$();
    expect(screen.getByText("0/500")).toBeInTheDocument();
  });
});

// ── Subtitle varies by trader type ───────────────────────────────

describe("TradingStyleStep — subtitle by trader type", () => {
  test("manual trader sees generic subtitle", () => {
    render$({ wizardData: { ...baseWizard, traderType: "manual" } });
    expect(screen.getByText("Tell us about your trading style")).toBeInTheDocument();
  });

  test("ea trader sees EA-specific subtitle", () => {
    render$({ wizardData: { ...baseWizard, traderType: "ea" } });
    expect(screen.getByText(/Configure your EA/i)).toBeInTheDocument();
  });

  test("prop trader sees prop-specific subtitle", () => {
    render$({ wizardData: { ...baseWizard, traderType: "prop" } });
    expect(screen.getByText(/trading approach/i)).toBeInTheDocument();
  });
});
