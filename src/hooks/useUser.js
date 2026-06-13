import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sendPasswordResetEmail, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import { userKeys, dashboardKeys, notificationKeys } from "@/lib/queryKeys";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

// ── Get full user profile ─────────────────────────────────────
export const useUserProfile = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:  userKeys.profile(),
    queryFn:   () => api.get(API.USER.PROFILE),
    select:    (data) => data?.user ?? data?.data ?? data ?? null,
    enabled:   isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

// ── Patch user profile ────────────────────────────────────────
export const useUpdateUserProfile = () => {
  const qc = useQueryClient();
  const { setMongoUser } = useAuthStore();
  return useMutation({
    mutationFn: (data) => api.patch(API.USER.PROFILE, data),
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: userKeys.profile() });
      const user = response?.user ?? response?.data ?? response;
      if (user && typeof user === "object" && user._id) {
        setMongoUser(user);
      }
    },
  });
};

// ── Patch AI preferences ──────────────────────────────────────
export const useUpdateAiPreferences = () => {
  const qc = useQueryClient();
  const { setMongoUser, mongoUser } = useAuthStore();
  return useMutation({
    mutationFn: (data) => api.patch(API.USER.PREFERENCES_AI, data),
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: userKeys.profile() });
      const user = response?.user ?? response?.data ?? response;
      if (user && typeof user === "object" && user._id) {
        setMongoUser(user);
      } else if (mongoUser) {
        setMongoUser({ ...mongoUser });
      }
    },
  });
};

// ── Patch notification preferences ───────────────────────────
export const useUpdateNotificationSettings = () => {
  const qc = useQueryClient();
  const { setMongoUser, mongoUser } = useAuthStore();
  return useMutation({
    mutationFn: (data) => api.patch(API.USER.PREFERENCES_NOTIFICATIONS, data),
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: userKeys.profile() });
      const user = response?.user ?? response?.data ?? response;
      if (user && typeof user === "object" && user._id) {
        setMongoUser(user);
      } else if (mongoUser) {
        setMongoUser({ ...mongoUser });
      }
    },
  });
};

// ── Update feature flags ──────────────────────────────────────
export const useUpdateFeatureFlags = () => {
  const qc = useQueryClient();
  const { setMongoUser } = useAuthStore();
  return useMutation({
    mutationFn: async (data) => {
      try {
        return await api.patch(API.USER.FEATURE_FLAGS, data);
      } catch (err) {
        // Endpoint not yet deployed — treat as soft-success so the
        // optimistic update from onMutate stays in the store.
        if (err?.status === 404 || err?.status === 405) return null;
        throw err;
      }
    },
    // Optimistically apply new flags to the store immediately so
    // pages that read featureFlags (e.g. /score) react without waiting.
    onMutate: (newFlags) => {
      const prev = useAuthStore.getState().mongoUser;
      if (prev) {
        setMongoUser({
          ...prev,
          featureFlags: { ...prev.featureFlags, ...newFlags },
        });
      }
      return { prev };
    },
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: userKeys.profile() });
      const user = response?.user ?? response?.data ?? response;
      if (user && typeof user === "object" && user._id) {
        setMongoUser(user);
      }
    },
    onError: (err, _vars, context) => {
      // Roll back optimistic update
      if (context?.prev) setMongoUser(context.prev);
      toast.error(err?.message ?? "Failed to update feature flags");
    },
  });
};

// ── Send password reset email ─────────────────────────────────
export const useSendPasswordReset = () => {
  return useMutation({
    mutationFn: (email) => sendPasswordResetEmail(auth, email),
    onSuccess: (_, email) => {
      toast.success(`Password reset email sent to ${email}`);
    },
    onError: (err) => toast.error(err?.message ?? "Failed to send reset email"),
  });
};

// ── Silent dashboard preferences update (no toast — for auto-save) ──
export const useSilentUpdateDashboardPreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch(API.DASHBOARD.PREFERENCES, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dashboardKeys.preferences() });
    },
  });
};

// ── Silent granular notification preferences (no toast — for auto-save) ──
export const useSilentUpdateNotificationPreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch(API.NOTIFICATION.PREFERENCES, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.preferences() });
    },
  });
};

// ── Delete user account ───────────────────────────────────────
// Backend requires: { confirmation: "DELETE" } and a Firebase token
// issued within the last 5 minutes (re-auth enforced by caller).
export const useDeleteUserAccount = () => {
  const { logout } = useAuthStore();
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api.delete(API.AUTH.DELETE_ACCOUNT, { data: { confirmation: "DELETE" } }),
    onSuccess: async () => {
      toast.success("Your account has been permanently deleted.");
      signOut(auth).catch(() => {}); // fire-and-forget — user is already being deleted
      logout();
      qc.clear();
      navigate("/login");
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to delete account"),
  });
};
