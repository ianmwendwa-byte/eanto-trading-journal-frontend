import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TIMEZONES = [
  { value: "UTC",                  label: "UTC" },
  { value: "Africa/Nairobi",       label: "Africa/Nairobi (EAT +3)" },
  { value: "Europe/London",        label: "Europe/London (GMT/BST)" },
  { value: "Europe/Paris",         label: "Europe/Paris (CET +1)" },
  { value: "Europe/Berlin",        label: "Europe/Berlin (CET +1)" },
  { value: "America/New_York",     label: "America/New_York (EST -5)" },
  { value: "America/Chicago",      label: "America/Chicago (CST -6)" },
  { value: "America/Los_Angeles",  label: "America/Los_Angeles (PST -8)" },
  { value: "America/Toronto",      label: "America/Toronto (EST -5)" },
  { value: "Asia/Tokyo",           label: "Asia/Tokyo (JST +9)" },
  { value: "Asia/Dubai",           label: "Asia/Dubai (GST +4)" },
  { value: "Asia/Singapore",       label: "Asia/Singapore (SGT +8)" },
  { value: "Asia/Shanghai",        label: "Asia/Shanghai (CST +8)" },
  { value: "Australia/Sydney",     label: "Australia/Sydney (AEST +10)" },
  { value: "Pacific/Auckland",     label: "Pacific/Auckland (NZST +12)" },
];

const COUNTRIES = [
  { value: "KE", label: "🇰🇪 Kenya" },
  { value: "US", label: "🇺🇸 United States" },
  { value: "GB", label: "🇬🇧 United Kingdom" },
  { value: "NG", label: "🇳🇬 Nigeria" },
  { value: "ZA", label: "🇿🇦 South Africa" },
  { value: "GH", label: "🇬🇭 Ghana" },
  { value: "AU", label: "🇦🇺 Australia" },
  { value: "CA", label: "🇨🇦 Canada" },
  { value: "DE", label: "🇩🇪 Germany" },
  { value: "FR", label: "🇫🇷 France" },
  { value: "SG", label: "🇸🇬 Singapore" },
  { value: "AE", label: "🇦🇪 UAE" },
  { value: "IN", label: "🇮🇳 India" },
  { value: "JP", label: "🇯🇵 Japan" },
  { value: "BR", label: "🇧🇷 Brazil" },
  { value: "MX", label: "🇲🇽 Mexico" },
  { value: "ZM", label: "🇿🇲 Zambia" },
  { value: "TZ", label: "🇹🇿 Tanzania" },
  { value: "UG", label: "🇺🇬 Uganda" },
];

const schema = z.object({
  firstName:   z.string().min(2, "At least 2 characters"),
  lastName:    z.string().min(2, "At least 2 characters"),
  phoneNumber: z.string().min(5, "Enter a valid phone number"),
  timezone:    z.string().min(1, "Select a timezone"),
  country:     z.string().optional(),
});

const FF = ({ label, children, error, required }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
    {error && <p className="text-xs text-destructive">{error.message}</p>}
  </div>
);

export const ProfileStep = ({ wizardData, onChange, onValidChange }) => {
  const { register, control, watch, formState: { errors, isValid } } = useForm({
    resolver:      zodResolver(schema),
    defaultValues: {
      firstName:   wizardData.firstName   ?? "",
      lastName:    wizardData.lastName    ?? "",
      phoneNumber: wizardData.phoneNumber ?? "",
      timezone:    wizardData.timezone    ?? "UTC",
      country:     wizardData.country     ?? "",
    },
    mode: "onChange",
  });

  // Sync RHF values up to parent wizard state
  const values = watch();
  useEffect(() => {
    onChange(values);
  }, [JSON.stringify(values)]); // eslint-disable-line

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid]); // eslint-disable-line

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">
          Let's set up your profile
        </h3>
        <p className="text-xs text-muted-foreground">Tell us about yourself</p>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <FF label="First Name" required error={errors.firstName}>
          <Input
            placeholder="John"
            className="bg-background border-border"
            {...register("firstName")}
          />
        </FF>
        <FF label="Last Name" required error={errors.lastName}>
          <Input
            placeholder="Doe"
            className="bg-background border-border"
            {...register("lastName")}
          />
        </FF>
      </div>

      {/* Phone */}
      <FF label="Phone Number" required error={errors.phoneNumber}>
        <Input
          placeholder="+254712345678"
          className="bg-background border-border"
          {...register("phoneNumber")}
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          Used for account security
        </p>
      </FF>

      {/* Timezone */}
      <FF label="Timezone" required error={errors.timezone}>
        <Controller
          name="timezone"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-56">
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FF>

      {/* Country (optional) */}
      <FF label="Country">
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select country (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-56">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FF>
    </div>
  );
};
