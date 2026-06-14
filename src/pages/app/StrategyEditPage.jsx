import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Pencil, Loader2, ChevronDown, ChevronRight } from "lucide-react";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch }   from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { useStrategy, useCreateStrategy, useUpdateStrategy } from "@/hooks/useStrategies";
import { pageVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────
const CATEGORIES = [
  { value: "ict",                label: "ICT" },
  { value: "smc",                label: "SMC" },
  { value: "support_resistance", label: "Support & Resistance" },
  { value: "supply_demand",      label: "Supply & Demand" },
  { value: "volume_profile",     label: "Volume Profile" },
  { value: "price_action",       label: "Price Action" },
  { value: "indicator_based",    label: "Indicator-Based" },
  { value: "hybrid",             label: "Hybrid" },
  { value: "custom",             label: "Custom" },
];

const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"];

const SESSIONS = [
  { value: "asian",    label: "Asian" },
  { value: "london",   label: "London" },
  { value: "new_york", label: "New York" },
  { value: "sydney",   label: "Sydney" },
];

const SL_TYPES = [
  { value: "fixed",   label: "Fixed (price)" },
  { value: "percent", label: "Percent" },
  { value: "atr",     label: "ATR-based" },
];

const TP_TYPES = [
  { value: "fixed",   label: "Fixed (price)" },
  { value: "percent", label: "Percent" },
  { value: "rr",      label: "Risk/Reward" },
];

const CRITERIA_CATEGORIES = [
  { value: "market_structure", label: "Market Structure" },
  { value: "liquidity",        label: "Liquidity" },
  { value: "zones",            label: "Zones" },
  { value: "volume",           label: "Volume" },
  { value: "order_flow",       label: "Order Flow" },
  { value: "fibonacci",        label: "Fibonacci" },
  { value: "timing",           label: "Timing" },
  { value: "multi_timeframe",  label: "Multi-Timeframe" },
  { value: "confirmation",     label: "Confirmation" },
  { value: "fundamental",      label: "Fundamental" },
];

const CATEGORY_LABEL_MAP = Object.fromEntries(
  CRITERIA_CATEGORIES.map((c) => [c.value, c.label])
);

// ── Section wrapper ───────────────────────────────────────────
const Section = ({ title, subtitle, children }) => (
  <div className="trading-card p-5 space-y-4">
    <div>
      <h3 className="text-sm font-semibold font-heading text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const Field = ({ label, children, hint }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

// ── Multi-toggle chip group ───────────────────────────────────
const ChipToggle = ({ value, selected, onToggle }) => (
  <button
    type="button"
    onClick={() => onToggle(value)}
    className={cn(
      "px-2.5 py-1 rounded border text-xs font-medium transition-colors",
      selected
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-background text-muted-foreground border-border hover:border-primary/50"
    )}
  >
    {value}
  </button>
);

// ── Criteria builder ──────────────────────────────────────────
const BLANK_CRITERION = { label: "", category: "confirmation", required: false };

const CriterionRow = ({ criterion, onDelete, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(criterion);

  const handleSave = () => {
    if (!draft.label.trim()) return;
    onSave(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg space-y-2">
        <Input
          value={draft.label}
          onChange={(e) => setDraft((p) => ({ ...p, label: e.target.value }))}
          placeholder="Criterion label"
          className="bg-background border-border text-sm h-8"
          autoFocus
        />
        <div className="flex items-center gap-2">
          <Select value={draft.category} onValueChange={(v) => setDraft((p) => ({ ...p, category: v }))}>
            <SelectTrigger className="bg-background border-border h-8 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {CRITERIA_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
            <Switch
              checked={draft.required}
              onCheckedChange={(v) => setDraft((p) => ({ ...p, required: v }))}
              className="scale-75"
            />
            <span className="text-xs text-muted-foreground">Required</span>
          </label>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="h-7 text-xs" onClick={handleSave} disabled={!draft.label.trim()}>
            Save
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-foreground truncate">{criterion.label}</span>
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-muted text-muted-foreground border-border flex-shrink-0">
          {CATEGORY_LABEL_MAP[criterion.category] ?? criterion.category}
        </span>
        {criterion.required && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-primary/10 text-primary border-primary/20 flex-shrink-0">
            Required
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setEditing(true)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          size="sm" variant="ghost"
          className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

const AddCriterionForm = ({ onAdd, onCancel }) => {
  const [draft, setDraft] = useState(BLANK_CRITERION);

  const handleAdd = () => {
    if (!draft.label.trim()) return;
    onAdd({ ...draft, id: crypto.randomUUID() });
    setDraft(BLANK_CRITERION);
  };

  return (
    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
      <Input
        value={draft.label}
        onChange={(e) => setDraft((p) => ({ ...p, label: e.target.value }))}
        placeholder="e.g. Break of structure above previous high"
        className="bg-background border-border text-sm h-8"
        autoFocus
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
      />
      <div className="flex items-center gap-2">
        <Select value={draft.category} onValueChange={(v) => setDraft((p) => ({ ...p, category: v }))}>
          <SelectTrigger className="bg-background border-border h-8 text-xs flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {CRITERIA_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
          <Switch
            checked={draft.required}
            onCheckedChange={(v) => setDraft((p) => ({ ...p, required: v }))}
            className="scale-75"
          />
          <span className="text-xs text-muted-foreground">Required</span>
        </label>
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="h-7 text-xs" onClick={handleAdd} disabled={!draft.label.trim()}>
          Add
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────
export const StrategyEditPage = () => {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const isEdit      = !!id;

  const { data: existing, isLoading: loadingExisting } = useStrategy(id);
  const { mutate: createStrategy, isPending: creating } = useCreateStrategy();
  const { mutate: updateStrategy, isPending: updating } = useUpdateStrategy(id);

  // ── Form state ────────────────────────────────────────────
  const [name,              setName]              = useState("");
  const [description,       setDescription]       = useState("");
  const [category,          setCategory]          = useState("custom");
  const [pairsRaw,          setPairsRaw]          = useState("");
  const [timeframes,        setTimeframes]        = useState([]);
  const [sessions,          setSessions]          = useState([]);
  const [killzonesRaw,      setKillzonesRaw]      = useState("");
  const [maxRiskPerTrade,   setMaxRiskPerTrade]   = useState("");
  const [minRR,             setMinRR]             = useState("");
  const [slType,            setSlType]            = useState("");
  const [tpType,            setTpType]            = useState("");
  const [maxTradesPerDay,   setMaxTradesPerDay]   = useState("");
  const [criteria,          setCriteria]          = useState([]);
  const [confluenceMode,    setConfluenceMode]    = useState("all_required");
  const [confluenceMinCount,setConfluenceMinCount] = useState("");
  const [advancedOpen,      setAdvancedOpen]      = useState(false);
  const [addingCriterion,   setAddingCriterion]   = useState(false);
  const [nameError,         setNameError]         = useState("");

  // ── Pre-populate on edit ──────────────────────────────────
  useEffect(() => {
    if (!existing) return;
    setName(existing.name ?? "");
    setDescription(existing.description ?? "");
    setCategory(existing.category ?? "custom");
    setPairsRaw((existing.pairs ?? []).join(", "));
    setTimeframes(existing.timeframes ?? []);
    setSessions(existing.sessions ?? []);
    setKillzonesRaw((existing.killzones ?? []).join(", "));
    setMaxRiskPerTrade(existing.riskRules?.maxRiskPerTrade != null ? String(existing.riskRules.maxRiskPerTrade) : "");
    setMinRR(existing.riskRules?.minRR != null ? String(existing.riskRules.minRR) : "");
    setSlType(existing.riskRules?.slType ?? "");
    setTpType(existing.riskRules?.tpType ?? "");
    setMaxTradesPerDay(existing.riskRules?.maxTradesPerDay != null ? String(existing.riskRules.maxTradesPerDay) : "");
    setCriteria(existing.setupCriteria ?? []);
    setConfluenceMode(existing.confluence?.mode ?? "all_required");
    setConfluenceMinCount(existing.confluence?.minCount != null ? String(existing.confluence.minCount) : "");
  }, [existing]);

  // ── Helpers ───────────────────────────────────────────────
  const toggleTimeframe = (tf) =>
    setTimeframes((p) => p.includes(tf) ? p.filter((t) => t !== tf) : [...p, tf]);

  const toggleSession = (s) =>
    setSessions((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  const handleDeleteCriterion = (cid) =>
    setCriteria((p) => p.filter((c) => c.id !== cid));

  const handleSaveCriterion = (updated) =>
    setCriteria((p) => p.map((c) => (c.id === updated.id ? updated : c)));

  const handleAddCriterion = (criterion) => {
    setCriteria((p) => [...p, criterion]);
    setAddingCriterion(false);
  };

  const buildPayload = () => {
    const parseComma = (raw) =>
      (raw ?? "").split(",").map((s) => s.trim()).filter(Boolean);

    const parseNum = (s) => {
      const n = parseFloat(s);
      return Number.isNaN(n) ? null : n;
    };
    const parseInt2 = (s) => {
      const n = parseInt(s, 10);
      return Number.isNaN(n) ? null : n;
    };

    return {
      name:        name.trim(),
      description: description.trim() || undefined,
      category,
      pairs:       parseComma(pairsRaw).map((p) => p.toUpperCase()),
      timeframes,
      sessions,
      killzones:   parseComma(killzonesRaw),
      riskRules: {
        maxRiskPerTrade: parseNum(maxRiskPerTrade),
        minRR:           parseNum(minRR),
        slType:          slType || null,
        tpType:          tpType || null,
        maxTradesPerDay: parseInt2(maxTradesPerDay),
      },
      setupCriteria: criteria,
      confluence: {
        mode:     confluenceMode,
        minCount: confluenceMode === "min_count" ? (parseInt2(confluenceMinCount) ?? 0) : undefined,
      },
    };
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }
    setNameError("");
    const payload = buildPayload();

    if (isEdit) {
      updateStrategy(payload, {
        onSuccess: () => navigate("/strategies"),
      });
    } else {
      createStrategy(payload, {
        onSuccess: () => navigate("/strategies"),
      });
    }
  };

  const isPending = creating || updating;

  // ── Loading state (edit mode) ─────────────────────────────
  if (isEdit && loadingExisting) {
    return (
      <div className="p-6 space-y-4 max-w-2xl mx-auto">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
      </div>
    );
  }

  const indicators = existing?.indicators ?? [];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 space-y-5 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate("/strategies")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">
              {isEdit ? "Edit Strategy" : "New Strategy"}
            </h1>
            {isEdit && existing?.name && (
              <p className="text-xs text-muted-foreground">{existing.name}</p>
            )}
          </div>
        </div>
        <Button size="sm" onClick={handleSubmit} disabled={isPending} className="gap-1.5">
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save Strategy
        </Button>
      </div>

      {/* A) Identity */}
      <Section title="Identity" subtitle="What is this strategy called and how does it trade?">
        <Field label="Strategy Name *">
          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); if (e.target.value.trim()) setNameError(""); }}
            placeholder="e.g. ICT NY Kill Zone"
            className={cn("bg-background border-border", nameError && "border-destructive")}
          />
          {nameError && <p className="text-[11px] text-destructive mt-1">{nameError}</p>}
        </Field>
        <Field label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of when and how this strategy is applied..."
            rows={2}
            className="bg-background border-border resize-none"
          />
        </Field>
        <Field label="Category">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>

      {/* B) Market Context */}
      <Section title="Market Context" subtitle="Which markets, sessions, and times does this apply to?">
        <Field label="Pairs" hint="Comma-separated. e.g. EURUSD, GBPUSD, XAUUSD">
          <Input
            value={pairsRaw}
            onChange={(e) => setPairsRaw(e.target.value)}
            placeholder="EURUSD, GBPUSD"
            className="bg-background border-border"
          />
        </Field>
        <Field label="Timeframes">
          <div className="flex flex-wrap gap-1.5">
            {TIMEFRAMES.map((tf) => (
              <ChipToggle
                key={tf}
                value={tf}
                selected={timeframes.includes(tf)}
                onToggle={toggleTimeframe}
              />
            ))}
          </div>
        </Field>
        <Field label="Sessions">
          <div className="flex flex-wrap gap-1.5">
            {SESSIONS.map((s) => (
              <ChipToggle
                key={s.value}
                value={s.label}
                selected={sessions.includes(s.value)}
                onToggle={() => toggleSession(s.value)}
              />
            ))}
          </div>
        </Field>
        <Field label="Kill Zones" hint="Optional. Comma-separated time ranges. e.g. 02:00-05:00, 08:30-11:00">
          <Input
            value={killzonesRaw}
            onChange={(e) => setKillzonesRaw(e.target.value)}
            placeholder="02:00-05:00, 08:30-11:00"
            className="bg-background border-border"
          />
        </Field>
      </Section>

      {/* C) Risk Rules */}
      <Section title="Risk Rules" subtitle="Define your risk tolerance and trade management rules">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Max Risk / Trade (%)">
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                min="0"
                value={maxRiskPerTrade}
                onChange={(e) => setMaxRiskPerTrade(e.target.value)}
                placeholder="1"
                className="bg-background border-border pr-6"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">%</span>
            </div>
          </Field>
          <Field label="Minimum RR (1:?)">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">1:</span>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={minRR}
                onChange={(e) => setMinRR(e.target.value)}
                placeholder="2"
                className="bg-background border-border pl-8"
              />
            </div>
          </Field>
          <Field label="Stop Loss Type">
            <Select value={slType || "_none"} onValueChange={(v) => setSlType(v === "_none" ? "" : v)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="_none">Any</SelectItem>
                {SL_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Take Profit Type">
            <Select value={tpType || "_none"} onValueChange={(v) => setTpType(v === "_none" ? "" : v)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="_none">Any</SelectItem>
                {TP_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Max Trades / Day">
            <Input
              type="number"
              min="1"
              step="1"
              value={maxTradesPerDay}
              onChange={(e) => setMaxTradesPerDay(e.target.value)}
              placeholder="—"
              className="bg-background border-border"
            />
          </Field>
        </div>
      </Section>

      {/* D) Setup Criteria */}
      <Section
        title="Setup Criteria"
        subtitle="The checklist your setup must satisfy before entering a trade"
      >
        {criteria.length === 0 && !addingCriterion && (
          <p className="text-xs text-muted-foreground py-2">
            No criteria yet. Add criteria to enable setup assessment on trades.
          </p>
        )}
        <div className="space-y-1.5">
          {criteria.map((c) => (
            <CriterionRow
              key={c.id}
              criterion={c}
              onDelete={() => handleDeleteCriterion(c.id)}
              onSave={handleSaveCriterion}
            />
          ))}
          {addingCriterion && (
            <AddCriterionForm
              onAdd={handleAddCriterion}
              onCancel={() => setAddingCriterion(false)}
            />
          )}
        </div>
        {!addingCriterion && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-8 text-xs"
            onClick={() => setAddingCriterion(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Criterion
          </Button>
        )}
      </Section>

      {/* E) Confluence */}
      <Section
        title="Confluence"
        subtitle="How many criteria must pass before a setup is considered valid?"
      >
        <Field label="Mode">
          <div className="flex gap-2">
            {[
              { value: "all_required", label: "All Required Items" },
              { value: "min_count",    label: "Min. Count" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setConfluenceMode(opt.value)}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors",
                  confluenceMode === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>
        {confluenceMode === "all_required" && (
          <p className="text-xs text-muted-foreground">
            All criteria marked <span className="font-medium text-foreground">Required</span> must be
            checked before entering a trade. Optional criteria are informational only.
          </p>
        )}
        {confluenceMode === "min_count" && (
          <Field label="Minimum criteria checked" hint="Total checked (required + optional) must reach this count">
            <div className="w-28">
              <Input
                type="number"
                min="1"
                step="1"
                value={confluenceMinCount}
                onChange={(e) => setConfluenceMinCount(e.target.value)}
                placeholder="e.g. 3"
                className="bg-background border-border"
              />
            </div>
          </Field>
        )}
      </Section>

      {/* F) Advanced (collapsed) */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <div className="trading-card">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div>
                <p className="text-sm font-semibold font-heading text-foreground">Advanced</p>
                <p className="text-xs text-muted-foreground mt-0.5">Indicators and additional metadata</p>
              </div>
              {advancedOpen
                ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                : <ChevronRight className="h-4 w-4 text-muted-foreground" />
              }
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-5 pb-5 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Indicators</Label>
                {indicators.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No indicators configured. Indicators are set via the API or EA.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {indicators.map((ind, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded border bg-muted text-foreground border-border"
                      >
                        {typeof ind === "string" ? ind : ind.name ?? JSON.stringify(ind)}
                      </span>
                    ))}
                  </div>
                )}
                {indicators.length > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Indicator configuration is read-only from this form.
                  </p>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Footer save */}
      <div className="flex justify-end pb-6">
        <Button onClick={handleSubmit} disabled={isPending} className="gap-1.5">
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save Strategy
        </Button>
      </div>
    </motion.div>
  );
};
