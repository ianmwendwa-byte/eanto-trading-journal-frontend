import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { eaKeys, accountKeys, tradeKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";

// ── EA Status ─────────────────────────────────────────────────
// refetchInterval adapts to online state: 15s online, 60s offline
export const useEAStatus = (accountId, { polling = false, enabled: enabledOpt = true } = {}) =>
  useQuery({
    queryKey:        eaKeys.status(accountId),
    queryFn:         () => api.get(API.ACCOUNT.EA_STATUS(accountId)),
    select:          (res) => res?.data ?? res,
    enabled:         !!accountId && enabledOpt,
    staleTime:       15 * 1000,
    refetchInterval: polling
      ? (query) => (query.state.data?.isOnline ? 15_000 : 60_000)
      : false,
  });

// ── Reconciliation status ─────────────────────────────────────
// Polls aggressively (10s) while upload/reconcile is in progress
const isReconciliationActive = (data) => {
  const s = data?.session?.status;
  return s === "uploading" || s === "reconciling";
};

export const useReconciliation = (accountId, { enabled: enabledOpt = true } = {}) =>
  useQuery({
    queryKey:        eaKeys.reconciliation(accountId),
    queryFn:         () => api.get(API.ACCOUNT.RECONCILIATION(accountId)),
    select:          (res) => res?.data ?? res,
    enabled:         !!accountId && enabledOpt,
    staleTime:       10 * 1000,
    refetchInterval: (query) =>
      isReconciliationActive(query.state.data) ? 10_000 : 30_000,
  });

// ── Anomalies list ────────────────────────────────────────────
export const useAnomalies = (accountId, filters = {}) =>
  useQuery({
    queryKey: eaKeys.anomalies(accountId, filters),
    queryFn:  () =>
      api.get(API.ACCOUNT.ANOMALIES(accountId), { params: filters }),
    select:   (res) => res?.data ?? res,
    enabled:  !!accountId,
    staleTime: 30 * 1000,
  });

// ── Resolve anomaly ───────────────────────────────────────────
export const useResolveAnomaly = (accountId) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ anomalyId, resolution, note }) =>
      api.patch(API.ACCOUNT.ANOMALY_RESOLVE(accountId, anomalyId), { resolution, note }),

    onMutate: async ({ anomalyId }) => {
      // Cancel in-flight anomaly queries for this account
      await qc.cancelQueries({ queryKey: ["ea", "anomalies", accountId] });

      // Snapshot for rollback
      const previousEntries = qc.getQueriesData({ queryKey: ["ea", "anomalies", accountId] });

      // Optimistically mark anomaly resolved across all filter variants
      qc.setQueriesData(
        { queryKey: ["ea", "anomalies", accountId] },
        (old) => {
          if (!old?.anomalies) return old;
          return {
            ...old,
            anomalies: old.anomalies.map((a) =>
              a._id === anomalyId ? { ...a, status: "resolved" } : a
            ),
          };
        }
      );

      return { previousEntries };
    },

    onError: (_err, _vars, context) => {
      // Roll back on failure
      context?.previousEntries?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
      toast.error("Failed to resolve anomaly — please try again");
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["ea", "anomalies", accountId] });
      qc.invalidateQueries({ queryKey: eaKeys.reconciliation(accountId) });
      qc.invalidateQueries({ queryKey: eaKeys.status(accountId) });
    },
  });
};

// ── Generate EA Key ───────────────────────────────────────────
// Key is shown once via onSuccess callback — never stored in cache.
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
