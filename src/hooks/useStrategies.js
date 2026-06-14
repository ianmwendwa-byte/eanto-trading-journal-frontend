import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { strategyKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";
import { useAuthStore } from "@/store/useAuthStore";

export const useStrategies = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: strategyKeys.list(),
    queryFn:  () => api.get(API.STRATEGY.BASE),
    select:   (data) => data?.strategies ?? [],
    enabled:  isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

export const useStrategyTemplates = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:  strategyKeys.templates(),
    queryFn:   () => api.get(API.STRATEGY.TEMPLATES),
    select:    (data) => data?.templates ?? [],
    enabled:   isAuthenticated,
    staleTime: Infinity,
  });
};

export const useStrategy = (id) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:  strategyKeys.detail(id),
    queryFn:   () => api.get(API.STRATEGY.DETAIL(id)),
    select:    (data) => data?.strategy ?? null,
    enabled:   !!id && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateStrategy = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(API.STRATEGY.BASE, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: strategyKeys.lists() });
      toast.success("Strategy created");
      return res?.strategy;
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Failed to create strategy"),
  });
};

export const useUpdateStrategy = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch(API.STRATEGY.DETAIL(id), data),
    onSuccess: (res) => {
      if (res?.strategy) {
        qc.setQueryData(strategyKeys.detail(id), res.strategy);
      }
      qc.invalidateQueries({ queryKey: strategyKeys.lists() });
      toast.success("Strategy saved");
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Failed to update strategy"),
  });
};

export const useDeleteStrategy = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(API.STRATEGY.DETAIL(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: strategyKeys.all() });
      toast.success("Strategy deleted");
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Failed to delete strategy"),
  });
};
