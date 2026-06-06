import { useState, useEffect, useCallback, useMemo } from "react";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button }   from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton }           from "@/components/ui/skeleton";
import { AlertCircle, Save, Loader2 } from "lucide-react";
import { useUpdateUserProfile } from "@/hooks/useUser";
import { useAuthStore }       from "@/store/useAuthStore";
import { toast }              from "sonner";
import { cn }                 from "@/lib/utils";

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "America/Toronto", "America/Sao_Paulo",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Africa/Nairobi", "Africa/Lagos", "Africa/Cairo", "Africa/Johannesburg",
  "Asia/Dubai", "Asia/Riyadh", "Asia/Kolkata", "Asia/Bangkok",
  "Asia/Singapore", "Asia/Tokyo", "Asia/Shanghai", "Asia/Hong_Kong",
  "Australia/Sydney", "Australia/Melbourne", "Pacific/Auckland",
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Spain", "Italy", "Netherlands", "Sweden", "Norway", "Denmark",
  "Switzerland", "Belgium", "Austria", "Poland", "Portugal", "Czech Republic",
  "South Africa", "Nigeria", "Kenya", "Ghana", "Egypt", "Morocco",
  "India", "Pakistan", "Bangladesh", "Singapore", "Malaysia", "Indonesia",
  "Philippines", "Thailand", "Vietnam", "Japan", "South Korea", "China",
  "United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Turkey",
  "Brazil", "Argentina", "Colombia", "Mexico", "Chile", "Peru",
  "New Zealand", "Other",
];

const Field = ({ label, error, children }) => (
  <div className="space-y-1.5">
    {label && <Label className="text-sm font-medium text-foreground">{label}</Label>}
    {children}
    {error && (
      <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "var(--loss)" }}>
        <AlertCircle className="h-3 w-3 shrink-0" />
        {error}
      </p>
    )}
  </div>
);

export const ProfileSection = ({ onDirtyChange }) => {
  const { mongoUser } = useAuthStore();
  const { mutateAsync, isPending } = useUpdateUserProfile();

  const initPersonal = useCallback(() => ({
    firstName:   mongoUser?.firstName   ?? "",
    lastName:    mongoUser?.lastName    ?? "",
    phoneNumber: mongoUser?.phoneNumber ?? "",
    country:     mongoUser?.traderProfile?.country  ?? "",
    timezone:    mongoUser?.traderProfile?.timezone ?? "UTC",
  }), [mongoUser]);

  const initIdentity = useCallback(() => ({
    displayName:      mongoUser?.traderProfile?.displayName ?? "",
    tradingName:      mongoUser?.traderProfile?.tradingName ?? "",
    bio:              mongoUser?.traderProfile?.bio ?? "",
    tradingStartDate: mongoUser?.traderProfile?.tradingStartDate
      ? new Date(mongoUser.traderProfile.tradingStartDate).toISOString().split("T")[0]
      : "",
  }), [mongoUser]);

  const [personal, setPersonal]   = useState(initPersonal);
  const [identity, setIdentity]   = useState(initIdentity);
  const [errors,   setErrors]     = useState({});

  useEffect(() => {
    setPersonal(initPersonal());
    setIdentity(initIdentity());
    setErrors({});
  }, [mongoUser?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const savedPersonal = useMemo(() => ({
    firstName:   mongoUser?.firstName   ?? "",
    lastName:    mongoUser?.lastName    ?? "",
    phoneNumber: mongoUser?.phoneNumber ?? "",
    country:     mongoUser?.traderProfile?.country  ?? "",
    timezone:    mongoUser?.traderProfile?.timezone ?? "UTC",
  }), [mongoUser]);

  const savedIdentity = useMemo(() => ({
    displayName:      mongoUser?.traderProfile?.displayName ?? "",
    tradingName:      mongoUser?.traderProfile?.tradingName ?? "",
    bio:              mongoUser?.traderProfile?.bio ?? "",
    tradingStartDate: mongoUser?.traderProfile?.tradingStartDate
      ? new Date(mongoUser.traderProfile.tradingStartDate).toISOString().split("T")[0]
      : "",
  }), [mongoUser]);

  const isDirty = useMemo(() => (
    personal.firstName   !== savedPersonal.firstName   ||
    personal.lastName    !== savedPersonal.lastName    ||
    personal.phoneNumber !== savedPersonal.phoneNumber ||
    personal.country     !== savedPersonal.country     ||
    personal.timezone    !== savedPersonal.timezone    ||
    identity.displayName     !== savedIdentity.displayName     ||
    identity.tradingName     !== savedIdentity.tradingName     ||
    identity.bio             !== savedIdentity.bio             ||
    identity.tradingStartDate !== savedIdentity.tradingStartDate
  ), [personal, identity, savedPersonal, savedIdentity]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = () => {
    const errs = {};
    if (!personal.firstName.trim())       errs.firstName = "First name is required";
    else if (personal.firstName.length > 50) errs.firstName = "Max 50 characters";
    if (!personal.lastName.trim())        errs.lastName = "Last name is required";
    else if (personal.lastName.length > 50)  errs.lastName = "Max 50 characters";
    if (personal.phoneNumber.trim() && !/^\+?[1-9]\d{6,14}$/.test(personal.phoneNumber.trim())) {
      errs.phoneNumber = "Format: +254712345678";
    }
    if (identity.bio.length > 500) errs.bio = "Max 500 characters";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const payload = {};

    if (personal.firstName.trim()) payload.firstName = personal.firstName.trim();
    if (personal.lastName.trim())  payload.lastName  = personal.lastName.trim();
    if (personal.phoneNumber.trim()) payload.phoneNumber = personal.phoneNumber.trim();

    payload.traderProfile = {
      country:     personal.country  || undefined,
      timezone:    personal.timezone || "UTC",
      displayName: identity.displayName  || undefined,
      tradingName: identity.tradingName  || undefined,
      bio:         identity.bio          || undefined,
      ...(identity.tradingStartDate && { tradingStartDate: identity.tradingStartDate }),
    };

    try {
      await mutateAsync(payload);
      toast.success("Profile saved");
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save changes";
      toast.error(msg);
    }
  };

  const initials = [mongoUser?.firstName?.[0], mongoUser?.lastName?.[0]]
    .filter(Boolean).join("").toUpperCase() || "T";

  if (!mongoUser) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <span className="text-lg sm:text-xl font-bold text-primary">{initials}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {`${mongoUser.firstName ?? ""} ${mongoUser.lastName ?? ""}`.trim() || "Trader"}
          </p>
          <p className="text-xs text-muted-foreground">{mongoUser.email ?? ""}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Profile photo upload coming in Q3</p>
        </div>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="bg-muted/50 w-full sm:w-auto">
          <TabsTrigger value="personal" className="flex-1 sm:flex-none">Personal Info</TabsTrigger>
          <TabsTrigger value="identity" className="flex-1 sm:flex-none">Trader Identity</TabsTrigger>
        </TabsList>

        {/* ── Personal Info ──────────────────────── */}
        <TabsContent value="personal" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" error={errors.firstName}>
              <Input
                value={personal.firstName}
                onChange={(e) => { setPersonal((p) => ({ ...p, firstName: e.target.value })); setErrors((e) => ({ ...e, firstName: undefined })); }}
                placeholder="First name"
                className={cn("bg-background border-border h-11", errors.firstName && "border-destructive")}
              />
            </Field>
            <Field label="Last Name" error={errors.lastName}>
              <Input
                value={personal.lastName}
                onChange={(e) => { setPersonal((p) => ({ ...p, lastName: e.target.value })); setErrors((e) => ({ ...e, lastName: undefined })); }}
                placeholder="Last name"
                className={cn("bg-background border-border h-11", errors.lastName && "border-destructive")}
              />
            </Field>
          </div>

          <Field label="Phone Number" error={errors.phoneNumber}>
            <Input
              value={personal.phoneNumber}
              onChange={(e) => { setPersonal((p) => ({ ...p, phoneNumber: e.target.value })); setErrors((e) => ({ ...e, phoneNumber: undefined })); }}
              placeholder="+254712345678"
              type="tel"
              inputMode="tel"
              className={cn("bg-background border-border h-11", errors.phoneNumber && "border-destructive")}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Country">
              <Select value={personal.country} onValueChange={(v) => setPersonal((p) => ({ ...p, country: v }))}>
                <SelectTrigger className="bg-background border-border h-11">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Timezone">
              <Select value={personal.timezone} onValueChange={(v) => setPersonal((p) => ({ ...p, timezone: v }))}>
                <SelectTrigger className="bg-background border-border h-11">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </TabsContent>

        {/* ── Trader Identity ────────────────────── */}
        <TabsContent value="identity" className="mt-4 space-y-4">
          <Field label="Display Name">
            <Input
              value={identity.displayName}
              onChange={(e) => setIdentity((i) => ({ ...i, displayName: e.target.value }))}
              placeholder="How you appear to others"
              className="bg-background border-border h-11"
            />
          </Field>

          <Field label="Trading Name / Brand">
            <Input
              value={identity.tradingName}
              onChange={(e) => setIdentity((i) => ({ ...i, tradingName: e.target.value }))}
              placeholder="Your trading alias"
              className="bg-background border-border h-11"
            />
          </Field>

          <Field label="Bio" error={errors.bio}>
            <div className="relative">
              <Textarea
                value={identity.bio}
                onChange={(e) => { setIdentity((i) => ({ ...i, bio: e.target.value })); setErrors((e) => ({ ...e, bio: undefined })); }}
                placeholder="Brief description of your trading approach..."
                maxLength={500}
                rows={4}
                className={cn("bg-background border-border resize-none text-sm", errors.bio && "border-destructive")}
              />
              <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
                {identity.bio.length}/500
              </span>
            </div>
          </Field>

          <Field label="Trading Start Date">
            <p className="text-xs text-muted-foreground mb-1">When did you start trading?</p>
            <Input
              type="date"
              value={identity.tradingStartDate}
              onChange={(e) => setIdentity((i) => ({ ...i, tradingStartDate: e.target.value }))}
              className="bg-background border-border h-11"
            />
          </Field>
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
