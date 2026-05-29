import { ComingSoon } from "@/components/shared/ComingSoon";
import { Lightbulb } from "lucide-react";

export const Insights = () => (
  <ComingSoon
    icon={Lightbulb}
    title="AI Insights"
    description="Your personal AI trading coach that analyzes your journal, identifies patterns, and gives you a weekly debrief."
    features={[
      {
        title: "Weekly AI Debrief",
        description: "Every Friday get a full breakdown of your trading week with actionable advice",
      },
      {
        title: "AI Journaling Agent",
        description: "Talk to your AI coach about any trade and get instant feedback",
      },
      {
        title: "Pattern Recognition",
        description: "AI detects your psychological trading patterns before they become expensive habits",
      },
    ]}
  />
);
