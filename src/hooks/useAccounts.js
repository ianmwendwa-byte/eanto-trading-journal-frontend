import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { accountKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";

// Maps the combined sort string from the toolbar to backend params
const SORT_MAP = {
  createdAt_desc:  { sortBy: "createdAt",       sortOrder: "desc" },
  createdAt_asc:   { sortBy: "createdAt",       sortOrder: "asc"  },
  balance_desc:    { sortBy: "balanceSnapshot", sortOrder: "desc" },
  balance_asc:     { sortBy: "balanceSnapshot", sortOrder: "asc"  },
  name_asc:        { sortBy: "name",            sortOrder: "asc"  },
  name_desc:       { sortBy: "name",            sortOrder: "desc" },
};

// ── List accounts with filter / pagination / client-side search ─
export const useAccounts = (filters = {}) => {
  const { q = "", sort = "createdAt_desc", type, page = 1, limit = 9 } = filters;
  const hasSearch = q.trim().length > 0;
  const { sortBy, sortOrder } = SORT_MAP[sort] ?? SORT_MAP.createdAt_desc;

  // When searching, fetch a larger page so results aren't cut off by pagination
  const params = {
    sortBy,
    sortOrder,
    page:  hasSearch ? 1  : page,
    limit: hasSearch ? 50 : limit,
    ...(type ? { type } : {}),
  };

  return useQuery({
    queryKey: accountKeys.list(filters),
    queryFn:  () => api.get(API.ACCOUNT.BASE, { params }),
    select: (data) => {
      const raw = data?.accounts ?? [];
      const accounts = hasSearch
        ? raw.filter((a) => a.name?.toLowerCase().includes(q.trim().toLowerCase()))
        : raw;

      // When searching: collapse pagination (all results on one virtual page)
      const pagination = hasSearch
        ? {
            total:       accounts.length,
            page:        1,
            limit:       accounts.length || 1,
            totalPages:  1,
            hasNextPage: false,
            hasPrevPage: false,
          }
        : data?.pagination ?? {
            total:       0,
            page:        1,
            limit:       9,
            totalPages:  0,
            hasNextPage: false,
            hasPrevPage: false,
          };

      return { accounts, pagination };
    },
    staleTime:       5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
};

// ── Single account ─────────────────────────────────────────────
export const useAccount = (id) =>
  useQuery({
    queryKey:  accountKeys.detail(id),
    queryFn:   () => api.get(API.ACCOUNT.DETAIL(id)),
    select:    (data) => data?.account ?? data,
    enabled:   !!id,
    staleTime: 5 * 60 * 1000,
  });

// ── Create account ─────────────────────────────────────────────
export const useCreateAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(API.ACCOUNT.BASE, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.all() });
      toast.success("Account created successfully");
    },
    onError: (error) => toast.error(error.message ?? "Failed to create account"),
  });
};

// ── Update account ─────────────────────────────────────────────
export const useUpdateAccount = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch(API.ACCOUNT.DETAIL(id), data),
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: accountKeys.all() });
      qc.setQueryData(accountKeys.detail(id), response);
      toast.success("Account updated");
    },
    onError: (error) => toast.error(error.message ?? "Failed to update account"),
  });
};

// ── Delete account ─────────────────────────────────────────────
export const useDeleteAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(API.ACCOUNT.DETAIL(id)),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: accountKeys.all() });
      qc.removeQueries({ queryKey: accountKeys.detail(id) });
      toast.success("Account deleted");
    },
    onError: (error) => toast.error(error.message ?? "Failed to delete account"),
  });
};

// ── EA status (polls every 30s) ───────────────────────────────
export const useEAStatus = (id) =>
  useQuery({
    queryKey:        accountKeys.ea(id),
    queryFn:         () => api.get(API.ACCOUNT.EA_STATUS(id)),
    select:          (data) => data?.status ?? data,
    enabled:         !!id,
    staleTime:       30 * 1000,
    refetchInterval: 30 * 1000,
  });

// ── Generate EA API key ───────────────────────────────────────
export const useGenerateEAKey = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(API.ACCOUNT.EA_GENERATE(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.ea(id) });
    },
    onError: (error) => toast.error(error.message ?? "Failed to generate EA key"),
  });
};

// ── Revoke EA API key ─────────────────────────────────────────
export const useRevokeEAKey = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(API.ACCOUNT.EA_REVOKE(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.ea(id) });
      toast.success("EA API key revoked");
    },
    onError: (error) => toast.error(error.message ?? "Failed to revoke EA key"),
  });
};
