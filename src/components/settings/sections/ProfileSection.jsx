import { useState, useEffect, useCallback } from "react";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton }           from "@/components/ui/skeleton";
import { AlertCircle }        from "lucide-react";
import { AutoSaveIndicator }  from "@/components/settings/AutoSaveIndicator";
import { useAutoSave }        from "@/hooks/useAutoSave";
import { useUpdateUserProfile } from "@/hooks/useUser";
import { useAuthStore }       from "@/store/useAuthStore";

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
      <p className="text-xs flex items-center gap-1" style={{ color: "var(--loss)" }}>
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    )}
  </div>
);

export const ProfileSection = ({ onDirtyChange }) => {
  const { mongoUser } = useAuthStore();
  const { mutateAsync: updateProfile } = useUpdateUserProfile();

  const initPersonal = useCallback(() => ({
    firstName:   mongoUser?.firstName   ?? "",
    lastName:    mongoUser?.lastName    ?? "",
    phoneNumber: mongoUser?.phoneNumber ?? "",
    country:     mongoUser?.traderProfile?.country   ?? mongoUser?.country   ?? "",
    timezone:    mongoUser?.traderProfile?.timezone  ?? mongoUser?.timezone  ?? "UTC",
  }), [mongoUser]);

  const initIdentity = useCallback(() => ({
    displayName:       mongoUser?.traderProfile?.displayName      ?? "",
    tradingName:       mongoUser?.traderProfile?.tradingName      ?? "",
    bio:               mongoUser?.traderProfile?.bio              ?? mongoUser?.bio ?? "",
    tradingStartDate:  mongoUser?.traderProfile?.tradingStartDate
      ? new Date(mongoUser.traderProfile.tradingStartDate).toISOString().split("T")[0]
      : "",
  }), [mongoUser]);

  const [personal, setPersonal] = useState(initPersonal);
  const [identity, setIdentity] = useState(initIdentity);

  useEffect(() => {
    setPersonal(initPersonal());
    setIdentity(initIdentity());
  }, [mongoUser?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    save:    savePersonal,
    status:  personalStatus,
    error:   personalError,
    isDirty: personalDirty,
  } = useAutoSave({ mutationFn: (d) => updateProfile(d) });

  const {
    save:    saveIdentity,
    status:  identityStatus,
    error:   identityError,
    isDirty: identityDirty,
  } = useAutoSave({ mutationFn: (d) => updateProfile(d) });

  useEffect(() => {
    onDirtyChange?.(personalDirty || identityDirty);
  }, [personalDirty, identityDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePersonal = (field, value) => {
    const next = { ...personal, [field]: value };
    setPersonal(next);
    savePersonal({
      firstName:    next.firstName,
      lastName:     next.lastName,
      phoneNumber:  next.phoneNumber,
      traderProfile: {
        country:  next.country,
        timezone: next.timezone,
      },
    });
  };

  const handleIdentity = (field, value) => {
    const next = { ...identity, [field]: value };
    setIdentity(next);
    saveIdentity({
      traderProfile: {
        displayName:      next.displayName  || undefined,
        tradingName:      next.tradingName  || undefined,
        bio:              next.bio          || undefined,
        ...(next.tradingStartDate && { tradingStartDate: next.tradingStartDate }),
      },
    });
  };

  const initials = [mongoUser?.firstName?.[0], mongoUser?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "T";

  if (!mongoUser) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar placeholder */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <span className="text-xl font-bold text-primary">{initials}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {`${mongoUser.firstName ?? ""} ${mongoUser.lastName ?? ""}`.trim() || "Trader"}
          </p>
          <p className="text-xs text-muted-foreground">{mongoUser.email ?? ""}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Profile photo upload coming in Q3
          </p>
        </div>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="identity">Trader Identity</TabsTrigger>
        </TabsList>

        {/* ── Personal Info ───────────────────────── */}
        <TabsContent value="personal" className="mt-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Personal Information</p>
            <AutoSaveIndicator status={personalStatus} />
          </div>

          {personalError && (
            <p className="text-xs flex items-center gap-1 p-2 rounded-md bg-destructive/10"
               style={{ color: "var(--loss)" }}>
              <AlertCircle className="h-3.5 w-3.5" />
              {personalError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name">
              <Input
                value={personal.firstName}
                onChange={(e) => handlePersonal("firstName", e.target.value)}
                placeholder="First name"
                className="bg-background border-border"
              />
            </Field>
            <Field label="Last Name">
              <Input
                value={personal.lastName}
                onChange={(e) => handlePersonal("lastName", e.target.value)}
                placeholder="Last name"
                className="bg-background border-border"
              />
            </Field>
          </div>

          <Field label="Phone Number">
            <Input
              value={personal.phoneNumber}
              onChange={(e) => handlePersonal("phoneNumber", e.target.value)}
              placeholder="+254712345678"
              className="bg-background border-border"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Country">
              <Select
                value={personal.country}
                onValueChange={(v) => handlePersonal("country", v)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Timezone">
              <Select
                value={personal.timezone}
                onValueChange={(v) => handlePersonal("timezone", v)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </TabsContent>

        {/* ── Trader Identity ─────────────────────── */}
        <TabsContent value="identity" className="mt-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Trader Identity</p>
            <AutoSaveIndicator status={identityStatus} />
          </div>

          {identityError && (
            <p className="text-xs flex items-center gap-1 p-2 rounded-md bg-destructive/10"
               style={{ color: "var(--loss)" }}>
              <AlertCircle className="h-3.5 w-3.5" />
              {identityError}
            </p>
          )}

          <Field label="Display Name">
            <Input
              value={identity.displayName}
              onChange={(e) => handleIdentity("displayName", e.target.value)}
              placeholder="How you appear to others"
              className="bg-background border-border"
            />
          </Field>

          <Field label="Trading Name / Brand">
            <Input
              value={identity.tradingName}
              onChange={(e) => handleIdentity("tradingName", e.target.value)}
              placeholder="Your trading alias"
              className="bg-background border-border"
            />
          </Field>

          <Field label="Bio">
            <div className="relative">
              <Textarea
                value={identity.bio}
                onChange={(e) => handleIdentity("bio", e.target.value)}
                placeholder="Brief description of your trading approach..."
                maxLength={500}
                rows={4}
                className="bg-background border-border resize-none text-sm"
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
              onChange={(e) => handleIdentity("tradingStartDate", e.target.value)}
              className="bg-background border-border"
            />
          </Field>
        </TabsContent>
      </Tabs>
    </div>
  );
};
