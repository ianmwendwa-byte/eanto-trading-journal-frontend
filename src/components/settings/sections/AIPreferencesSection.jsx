import { useState, useEffect, useCallback, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Users, Zap, Save, Loader2 } from "lucide-react";
import { useUpdateAiPreferences } from "@/hooks/useUser";
import { useAuthStore }      from "@/store/useAuthStore";
import { toast }             from "sonner";
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
const DAY_SHORT = {
  monday:"Mon", tuesday:"Tue", wednesday:"Wed", thursday:"Thu",
  friday:"Fri", saturday:"Sat", sunday:"Sun",
};

const AGENT_TOGGLES = [
  {
    key:   "journalingAgentEnabled",
    label: "Journaling Agent",
    desc:  "AI analyses your trades and adds insights to notes",
  },
  {
    key:   "behaviouralAgentEnabled",
    label: "Behavioural Agent",
    desc:  "Detects revenge trading, overconfidence and patterns",
  },
  {
    key:   "weeklyDebriefEnabled",
    label: "Weekly Debrief Agent",
    desc:  "Weekly performance summary and coaching",
  },
];

export const AIPreferencesSection = ({ onDirtyChange }) => {
  const { mongoUser } = useAuthStore();
  const { mutateAsync, isPending } = useUpdateAiPreferences();

  const aiPrefs = mongoUser?.aiPreferences ?? {};

  const init = useCallback(() => ({
    agentTone:               aiPrefs?.agentTone              ?? "analyst",
    preferredDebriefDay:     aiPrefs?.preferredDebriefDay    ?? "sunday",
    weeklyDebriefEnabled:    aiPrefs?.weeklyDebriefEnabled   !== false,
    journalingAgentEnabled:  aiPrefs?.journalingAgentEnabled !== false,
    behaviouralAgentEnabled: aiPrefs?.behaviouralAgentEnabled !== false,
  }), [mongoUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const [data, setData] = useState(init);
  useEffect(() => { setData(init()); }, [mongoUser?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const saved = useMemo(() => init(), [init]);

  const isDirty = useMemo(() => (
    data.agentTone               !== saved.agentTone               ||
    data.preferredDebriefDay     !== saved.preferredDebriefDay     ||
    data.weeklyDebriefEnabled    !== saved.weeklyDebriefEnabled     ||
    data.journalingAgentEnabled  !== saved.journalingAgentEnabled   ||
    data.behaviouralAgentEnabled !== saved.behaviouralAgentEnabled
  ), [data, saved]);

  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (field, value) => setData((d) => ({ ...d, [field]: value }));

  const handleSave = async () => {
    try {
      await mutateAsync(data);
      toast.success("AI preferences saved");
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save changes";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="agents">
        <TabsList className="bg-muted/50 w-full sm:w-auto">
          <TabsTrigger value="agents"  className="flex-1 sm:flex-none">Agent Settings</TabsTrigger>
          <TabsTrigger value="debrief" className="flex-1 sm:flex-none">Debrief Settings</TabsTrigger>
        </TabsList>

        {/* ── Agent Settings ───────────────────────── */}
        <TabsContent value="agents" className="mt-4 space-y-6">
          {/* Agent tone */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-foreground">
              How should your AI coach communicate?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {AGENT_TONES.map((tone) => {
                const Icon       = tone.icon;
                const isSelected = data.agentTone === tone.value;
                return (
                  <button
                    key={tone.value}
                    type="button"
                    onClick={() => update("agentTone", tone.value)}
                    className={cn(
                      "flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-3 sm:gap-2 p-4 rounded-xl border-2 transition-colors duration-150 min-h-[56px] sm:min-h-0",
                      isSelected
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                    <div>
                      <p className={cn("text-xs font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                        {tone.label}
                      </p>
                      <p className="text-[10px] leading-tight mt-0.5 text-muted-foreground">
                        {tone.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agent toggles */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground mb-2">AI Agents</p>
            <div className="trading-card divide-y divide-border">
              {AGENT_TOGGLES.map(({ key, label, desc }) => (
                <div key={key} className="flex items-start justify-between gap-4 px-4 py-3 min-h-[56px]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <Switch
                    checked={!!data[key]}
                    onCheckedChange={(v) => update(key, v)}
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Debrief Settings ────────────────────── */}
        <TabsContent value="debrief" className="mt-4 space-y-6">
          {/* Weekly debrief toggle */}
          <div className="trading-card px-4 py-3">
            <div className="flex items-start justify-between gap-4 min-h-[56px]">
              <div>
                <p className="text-sm font-medium text-foreground">Enable Weekly Debrief</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Receive a personalized AI summary of your trading week
                </p>
              </div>
              <Switch
                checked={!!data.weeklyDebriefEnabled}
                onCheckedChange={(v) => update("weeklyDebriefEnabled", v)}
              />
            </div>
          </div>

          {/* Debrief day */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-foreground">
              When should we send your weekly debrief?
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map((day) => {
                const isSelected = data.preferredDebriefDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => update("preferredDebriefDay", day)}
                    disabled={!data.weeklyDebriefEnabled}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-150 min-h-[44px]",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
                      !data.weeklyDebriefEnabled && "opacity-40 pointer-events-none"
                    )}
                  >
                    {DAY_SHORT[day]}
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Save footer ─────────────────────────── */}
      <div className="pt-4 border-t border-border flex flex-col-reverse sm:flex-row sm:items-center gap-3">
        {isDirty && (
          <p className="text-xs text-muted-foreground text-center sm:text-left">Unsaved changes</p>
        )}
        <Button
          onClick={handleSave}
          disabled={!isDirty || isPending}
          size="sm"
          className="sm:ml-auto w-full sm:w-auto min-h-[44px] sm:min-h-0"
        >
          {isPending ? (
            <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Saving...</>
          ) : (
            <><Save className="h-3.5 w-3.5 mr-2" />Save Changes</>
          )}
        </Button>
      </div>
    </div>
  );
};
