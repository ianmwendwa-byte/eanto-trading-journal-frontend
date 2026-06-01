import { motion } from "framer-motion";
import { BarChart2, Users, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const AGENT_TONES = [
  {
    value:       "analyst",
    icon:        BarChart2,
    label:       "Analyst",
    description: "Data-driven insights and objective feedback",
  },
  {
    value:       "coach",
    icon:        Users,
    label:       "Coach",
    description: "Motivating guidance and encouragement",
  },
  {
    value:       "direct",
    icon:        Zap,
    label:       "Direct",
    description: "Straight to the point, no fluff",
  },
];

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const DAY_SHORT = { monday:"Mon", tuesday:"Tue", wednesday:"Wed", thursday:"Thu", friday:"Fri", saturday:"Sat", sunday:"Sun" };

const ToggleRow = ({ label, description, checked, onCheckedChange, id }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export const PreferencesStep = ({ wizardData, onChange }) => {
  const {
    agentTone, preferredDebriefDay,
    emailDigest, tradeAlerts, drawdownWarnings, weeklyDebrief, pushEnabled,
  } = wizardData;

  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">
          Customize your experience
        </h3>
        <p className="text-xs text-muted-foreground">You can change these anytime in Settings</p>
      </div>

      {/* AI agent tone */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-foreground">
          How should your AI coach communicate?
        </p>
        <div className="grid grid-cols-3 gap-2">
          {AGENT_TONES.map((tone) => {
            const Icon       = tone.icon;
            const isSelected = agentTone === tone.value;
            return (
              <motion.button
                key={tone.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                onClick={() => onChange({ agentTone: tone.value })}
                className={cn(
                  "flex flex-col items-center text-center gap-2 p-4 rounded-xl border-2 transition-colors duration-200",
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                )}
              >
                <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                <div>
                  <p className={cn("text-xs font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                    {tone.label}
                  </p>
                  <p className="text-[10px] leading-tight mt-0.5 text-muted-foreground">
                    {tone.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Weekly debrief day */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-foreground">
          When should we send your weekly debrief?
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {DAYS.map((day) => {
            const isSelected = preferredDebriefDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => onChange({ preferredDebriefDay: day })}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                )}
              >
                {DAY_SHORT[day]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification toggles */}
      <div className="space-y-0">
        <p className="text-xs font-medium text-foreground mb-2">Notification Preferences</p>
        <div className="trading-card px-4 divide-y divide-border">
          <ToggleRow
            id="trade-alerts"
            label="Trade Alerts"
            description="Notifications when trades are created or flagged"
            checked={!!tradeAlerts}
            onCheckedChange={(v) => onChange({ tradeAlerts: v })}
          />
          <ToggleRow
            id="drawdown-warnings"
            label="Drawdown Warnings"
            description="Alerts when you approach drawdown limits"
            checked={!!drawdownWarnings}
            onCheckedChange={(v) => onChange({ drawdownWarnings: v })}
          />
          <ToggleRow
            id="weekly-debrief"
            label="Weekly Debrief"
            description="Personalized AI summary of your trading week"
            checked={!!weeklyDebrief}
            onCheckedChange={(v) => onChange({ weeklyDebrief: v })}
          />

          {/* Email digest */}
          <div className="flex items-start justify-between gap-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Email Digest</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                How often to receive email summaries
              </p>
            </div>
            <Select
              value={emailDigest ?? "weekly"}
              onValueChange={(v) => onChange({ emailDigest: v })}
            >
              <SelectTrigger className="h-8 text-xs w-28 bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
