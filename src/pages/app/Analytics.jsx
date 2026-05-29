import { ComingSoon } from "@/components/shared/ComingSoon";
import { BarChart3 } from "lucide-react";

export const Analytics = () => (
  <ComingSoon
    icon={BarChart3}
    title="Advanced Analytics"
    description="Deep dive into your trading patterns with AI-powered behavioral analysis, cross-account comparisons, and automated pattern detection."
    features={[
      {
        title: "Behavioral Pattern Detection",
        description: "Automatically detect revenge trading, overconfidence, and loss aversion",
      },
      {
        title: "Cross-Account Analysis",
        description: "Compare performance across all accounts and detect behavioral bleed",
      },
      {
        title: "AI-Powered Insights",
        description: "Weekly AI debrief with personalized trading recommendations",
      },
    ]}
  />
);
