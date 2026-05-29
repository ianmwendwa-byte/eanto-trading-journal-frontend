import { ComingSoon } from "@/components/shared/ComingSoon";
import { Layers } from "lucide-react";

export const Strategies = () => (
  <ComingSoon
    icon={Layers}
    title="Strategy Manager"
    description="Build, track and refine your trading strategies with performance data and AI-powered optimization."
    features={[
      {
        title: "Strategy Performance Tracking",
        description: "Track win rate, RR, and profitability per strategy over time",
      },
      {
        title: "EA vs Manual Comparison",
        description: "Compare your EA performance against manual trading on the same strategy",
      },
      {
        title: "Strategy Graduation Pipeline",
        description: "Graduate War account strategies to live accounts with confidence",
      },
    ]}
  />
);
