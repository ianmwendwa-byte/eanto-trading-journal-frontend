import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { scoreKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";
import { useAuthStore } from "@/store/useAuthStore";

// ── User-level (aggregate across all non-war accounts) ─────────

export const useUserScore = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: scoreKeys.user(),
    queryFn: async () => {
      try {
        return await api.get(API.SCORE.USER);
      } catch (error) {
        if (error?.status === 404) return null;
        throw error;
      }
    },
    select:    (data) => data?.data ?? data ?? null,
    enabled:   isAuthenticated,
    staleTime: 60 * 60 * 1000,
    retry:     (failureCount, error) => error?.status !== 404 && failureCount < 3,
  });
};

export const useUserScoreHistory = (weeks = 12) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: scoreKeys.userHistory(weeks),
    queryFn: async () => {
      try {
        return await api.get(API.SCORE.USER_HISTORY, { params: { weeks } });
      } catch (error) {
        if (error?.status === 404) return null;
        throw error;
      }
    },
    select:    (data) => data?.data ?? data?.history ?? (Array.isArray(data) ? data : []),
    enabled:   isAuthenticated,
    staleTime: 60 * 60 * 1000,
    retry:     (failureCount, error) => error?.status !== 404 && failureCount < 3,
  });
};

export const useRecalculateScore = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(API.SCORE.RECALC_USER),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scoreKeys.user() });
      qc.invalidateQueries({ queryKey: ["score"] });
      toast.success("Score recalculated successfully");
    },
    onError: (error) => toast.error(error?.message ?? "Failed to recalculate score"),
  });
};

// ── Account-level ──────────────────────────────────────────────

export const useAccountScore = (accountId) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: scoreKeys.account(accountId),
    queryFn: async () => {
      try {
        return await api.get(API.SCORE.ACCOUNT(accountId));
      } catch (error) {
        if (error?.status === 404) return null;
        throw error;
      }
    },
    select:    (data) => data?.data ?? data ?? null,
    enabled:   isAuthenticated && !!accountId,
    staleTime: 60 * 60 * 1000,
    retry:     (failureCount, error) => error?.status !== 404 && failureCount < 3,
  });
};

export const useAccountScoreHistory = (accountId, weeks = 12) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: scoreKeys.history(accountId, weeks),
    queryFn: async () => {
      try {
        return await api.get(API.SCORE.HISTORY(accountId), { params: { weeks } });
      } catch (error) {
        if (error?.status === 404) return null;
        throw error;
      }
    },
    select:    (data) => data?.data ?? data?.history ?? (Array.isArray(data) ? data : []),
    enabled:   isAuthenticated && !!accountId,
    staleTime: 60 * 60 * 1000,
    retry:     (failureCount, error) => error?.status !== 404 && failureCount < 3,
  });
};

export const useRecalculateAccountScore = (accountId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(API.SCORE.RECALC_ACCOUNT(accountId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scoreKeys.account(accountId) });
      qc.invalidateQueries({ queryKey: scoreKeys.history(accountId, 12) });
      toast.success("Score recalculated");
    },
    onError: (error) => toast.error(error?.message ?? "Failed to recalculate score"),
  });
};
