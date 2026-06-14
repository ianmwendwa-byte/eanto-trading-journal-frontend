import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { strategyKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";
import { useAuthStore } from "@/store/useAuthStore";

export const useAccountStrategies = (accountId) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:  strategyKeys.assignments(accountId),
    queryFn:   () => api.get(API.ACCOUNT.ACCOUNT_STRATEGIES(accountId)),
    select:    (data) => data?.assignments ?? [],
    enabled:   !!accountId && isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAssignStrategy = (accountId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(API.ACCOUNT.ACCOUNT_STRATEGIES(accountId), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: strategyKeys.assignments(accountId) });
      toast.success("Strategy assigned");
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Failed to assign strategy"),
  });
};

export const useUnassignStrategy = (accountId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (strategyId) => api.delete(API.ACCOUNT.ACCOUNT_STRATEGY(accountId, strategyId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: strategyKeys.assignments(accountId) });
      toast.success("Strategy removed");
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Failed to remove strategy"),
  });
};

export const useSetDefaultStrategy = (accountId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (strategyId) => api.patch(API.ACCOUNT.ACCOUNT_STRATEGY_DEFAULT(accountId, strategyId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: strategyKeys.assignments(accountId) });
      toast.success("Default strategy updated");
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Failed to set default"),
  });
};
