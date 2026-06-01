import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { eaKeys, accountKeys, tradeKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";

// ── EA Status — polling controlled by caller ──────────────────
// Pass { polling: true } only when the EA tab/page is visible
export const useEAStatus = (accountId, { polling = false, enabled: enabledOpt = true } = {}) =>
  useQuery({
    queryKey:        eaKeys.status(accountId),
    queryFn:         () => api.get(API.ACCOUNT.EA_STATUS(accountId)),
    // Response: { success: true, data: { enabled, isOnline, hasApiKey, ... } }
    // Axios interceptor unwraps response.data → we receive { success, data:{...} }
    select:          (res) => res?.data ?? res,
    enabled:         !!accountId && enabledOpt,
    staleTime:       20 * 1000,
    refetchInterval: polling ? 30 * 1000 : false,
  });

// ── Generate EA Key ───────────────────────────────────────────
// Key is NEVER stored in cache — caller receives it via onSuccess callback only.
// We do NOT invalidate eaKeys.status here — that triggers a refetch which can
// remount EAKeyManager and reset local state before the user confirms the key.
// The 30s poll will pick up the new status naturally.
export const useGenerateEAKey = (accountId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(API.ACCOUNT.EA_GENERATE(accountId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.detail(accountId) });
    },
    onError: (error) => toast.error(error.message ?? "Failed to generate EA key"),
  });
};

// ── Revoke EA Key ─────────────────────────────────────────────
export const useRevokeEAKey = (accountId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(API.ACCOUNT.EA_REVOKE(accountId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.detail(accountId) });
      toast.success("EA key revoked successfully");
    },
    onError: (error) => toast.error(error.message ?? "Failed to revoke EA key"),
  });
};

// ── Update EA Config ──────────────────────────────────────────
export const useUpdateEAConfig = (accountId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch(API.ACCOUNT.EA_CONFIG(accountId), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eaKeys.status(accountId) });
      qc.invalidateQueries({ queryKey: accountKeys.detail(accountId) });
      toast.success("EA configuration saved");
    },
    onError: (error) => toast.error(error.message ?? "Failed to save EA configuration"),
  });
};

// ── EA Sync History ───────────────────────────────────────────
// Uses trades filtered by accountId — shows most recent EA-synced trades
export const useEASyncHistory = (accountId, { limit = 10 } = {}) =>
  useQuery({
    queryKey:  eaKeys.history(accountId),
    queryFn:   () => api.get(API.TRADE.BASE, {
      params: { accountId, limit, sort: "closedAt_desc" },
    }),
    select: (data) => {
      const trades = data?.trades ?? data?.data ?? [];
      return trades.slice(0, limit).map((t) => ({
        _id:         t._id,
        type:        "trade_sync",
        description: `${t.pair} ${t.direction?.toUpperCase()} synced`,
        pairs:       t.pair,
        status:      t.outcome === "win" || t.outcome === "loss" ? "success" : "partial",
        timestamp:   t.closedAt ?? t.createdAt,
        pnl:         t.netPnl ?? t.pnl,
      }));
    },
    enabled:   !!accountId,
    staleTime: 60 * 1000,
  });
