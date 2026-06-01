import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import { useAuthStore } from "@/store/useAuthStore";

// ── UI traderType → API tradingModes ─────────────────────────
export const mapTraderTypeToModes = (traderType) => {
  switch (traderType) {
    case "manual":    return ["manual"];
    case "prop":      return ["manual"];
    case "ea":        return ["ea"];
    case "semi-auto": return ["manual", "ea"];
    default:          return ["manual"];
  }
};

// ── Build onboarding payload ──────────────────────────────────
// Backend expects all fields at the TOP LEVEL (not nested).
// It destructures: { firstName, lastName, timezone, tradingModes, ... }
export const buildOnboardingPayload = (wizardData) => ({
  // ── profile_setup ─────────────────────────────────────
  firstName:   wizardData.firstName,
  lastName:    wizardData.lastName,
  phoneNumber: wizardData.phoneNumber,

  // ── preferences_set (flat — not nested under traderProfile) ──
  timezone:          wizardData.timezone,
  country:           wizardData.country    || undefined,
  experienceLevel:   wizardData.experienceLevel || "beginner",
  tradingModes:      mapTraderTypeToModes(wizardData.traderType),
  tradingStyles:     wizardData.tradingStyles,
  primaryPairs:      wizardData.primaryPairs      || [],
  preferredSessions: wizardData.preferredSessions || [],
  bio:               wizardData.bio               || undefined,

  // ── ai preferences (flat) ────────────────────────────
  agentTone:            wizardData.agentTone            || "analyst",
  preferredDebriefDay:  wizardData.preferredDebriefDay  || "sunday",
  weeklyDebriefEnabled: wizardData.weeklyDebrief !== false,
  journalingAgentEnabled:   true,
  behaviouralAgentEnabled:  true,

  // ── notification preferences (flat) ──────────────────
  emailDigest:      wizardData.emailDigest      || "weekly",
  tradeAlerts:      wizardData.tradeAlerts      !== false,
  drawdownWarnings: wizardData.drawdownWarnings !== false,
  weeklyDebrief:    wizardData.weeklyDebrief    !== false,
  pushEnabled:      wizardData.pushEnabled      === true,
});

// ── Complete onboarding ───────────────────────────────────────
export const useCompleteOnboarding = () => {
  const { setMongoUser, setOnboardingComplete } = useAuthStore();

  return useMutation({
    mutationFn: (payload) => api.post(API.USER.ONBOARDING_COMPLETE, payload),
    onSuccess: (response) => {
      if (response?.user) setMongoUser(response.user);
      // Use backend-confirmed value; fallback true since we got here
      setOnboardingComplete(response?.onboardingComplete ?? true);
    },
    onError: (error) => toast.error(error.message ?? "Failed to complete setup"),
  });
};

// ── Skip onboarding ───────────────────────────────────────────
// NOTE: The backend skipOnboarding has a TDZ bug and always throws 500.
// We handle both success and error by optimistically updating the local
// store with skippedAt so ProtectedRoute lets the user through.
export const useSkipOnboarding = () => {
  const { setMongoUser, mongoUser } = useAuthStore();
  const navigate = useNavigate();

  const applyLocalSkip = () => {
    // Persist to sessionStorage so ProtectedRoute survives hard refresh
    // even when the backend skip endpoint fails (known TDZ bug).
    try { sessionStorage.setItem("tc_onboarding_skipped", "true"); } catch {}
    if (mongoUser) {
      setMongoUser({
        ...mongoUser,
        onboarding: {
          ...(mongoUser.onboarding ?? {}),
          skippedAt: new Date().toISOString(),
        },
      });
    }
  };

  return useMutation({
    mutationFn: () => api.post(API.USER.ONBOARDING_SKIP),
    onSuccess: (response) => {
      // Backend returns the user document directly (not { user })
      const updatedUser = response?.user ?? response;
      if (updatedUser && typeof updatedUser === "object" && updatedUser._id) {
        setMongoUser(updatedUser);
        // Backend persisted skippedAt — sessionStorage fallback no longer needed
        try { sessionStorage.removeItem("tc_onboarding_skipped"); } catch {}
      } else {
        applyLocalSkip();
      }
      navigate("/dashboard");
    },
    onError: () => {
      // Backend throws (known TDZ bug) — apply local skip so ProtectedRoute
      // sees skippedAt and allows dashboard access.
      applyLocalSkip();
      navigate("/dashboard");
    },
  });
};
