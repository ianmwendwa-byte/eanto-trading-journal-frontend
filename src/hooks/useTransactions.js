import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { transactionKeys, accountKeys, dashboardKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";
import { useAuthStore } from "@/store/useAuthStore";

// ── List transactions with filters + pagination ───────────────
export const useTransactions = (filters = {}) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:        transactionKeys.list(filters),
    queryFn:         () => api.get(API.TRANSACTION.BASE, { params: filters }),
    select:          (data) => ({
      transactions: data?.data         ?? [],
      pagination:   data?.pagination   ?? { total: 0, page: 1, limit: 20, pages: 0 },
    }),
    enabled:         isAuthenticated,
    staleTime:       60 * 1000,
    placeholderData: (prev) => prev,
  });
};

// ── Summary totals ────────────────────────────────────────────
export const useTransactionSummary = (filters = {}, options = {}) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:  transactionKeys.summary(filters),
    queryFn:   () => api.get(API.TRANSACTION.SUMMARY, { params: filters }),
    select:    (data) => data?.data ?? null,
    enabled:   isAuthenticated && (options.enabled !== false),
    staleTime: 2 * 60 * 1000,
  });
};

// ── Balance history (equity curve) ───────────────────────────
export const useBalanceHistory = ({ accountId, ...filters } = {}, options = {}) => {
  const { isAuthenticated } = useAuthStore();
  const url = accountId
    ? API.TRANSACTION.ACCOUNT_BALANCE_HISTORY(accountId)
    : API.TRANSACTION.BALANCE_HISTORY;

  return useQuery({
    queryKey:  transactionKeys.history({ accountId, ...filters }),
    queryFn:   () => api.get(url, { params: filters }),
    select:    (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
    enabled:   isAuthenticated && options.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
};

// ── Transaction type distribution ────────────────────────────
export const useTransactionDistribution = (filters = {}) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:  transactionKeys.distribution(filters),
    queryFn:   () => api.get(API.TRANSACTION.DISTRIBUTION, { params: filters }),
    select:    (data) => data?.data ?? [],
    enabled:   isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
};

// ── Create manual transaction ─────────────────────────────────
export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(API.TRANSACTION.BASE, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: transactionKeys.all() });
      qc.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      if (variables?.accountId) {
        qc.invalidateQueries({ queryKey: accountKeys.detail(variables.accountId) });
      }
      toast.success("Transaction added");
    },
    onError: (error) => toast.error(error.message ?? "Failed to add transaction"),
  });
};

// ── Reverse a transaction ─────────────────────────────────────
export const useReverseTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(API.TRANSACTION.REVERSE(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transactionKeys.all() });
      qc.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      toast.success("Transaction reversed");
    },
    onError: (error) => toast.error(error.message ?? "Failed to reverse transaction"),
  });
};
