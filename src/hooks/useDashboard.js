import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { dashboardKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";
import { useAuthStore } from "@/store/useAuthStore";

export const useDashboardOverview = (params = {}) => {
  const { isAuthenticated } = useAuthStore();
  const {
    sections   = ["portfolio", "performance", "activity"],
    period     = "1m",
    accountId  = "all",
  } = params;

  return useQuery({
    queryKey:        dashboardKeys.overview({ sections, period, accountId }),
    queryFn:         () => api.get(API.DASHBOARD.OVERVIEW, {
      params: {
        sections: sections.join(","),
        period,
        ...(accountId !== "all" ? { accountId } : {}),
      },
    }),
    select:          (data) => data?.data ?? null,
    enabled:         isAuthenticated,
    staleTime:       2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry:           (count, error) => error?.status !== 404 && count < 2,
  });
};

export const useDashboardPreferences = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:  dashboardKeys.preferences(),
    queryFn:   async () => {
      try {
        return await api.get(API.DASHBOARD.PREFERENCES);
      } catch (error) {
        if (error?.status === 404 || error?.response?.status === 404) return null;
        throw error;
      }
    },
    select:    (data) => data?.preferences ?? null,
    enabled:   isAuthenticated,
    staleTime: 10 * 60 * 1000,
    retry:     (count, error) => error?.status !== 404 && count < 2,
  });
};

export const useUpdateDashboardPreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch(API.DASHBOARD.PREFERENCES, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dashboardKeys.preferences() });
      toast.success("Dashboard preferences saved");
    },
    onError: (error) => toast.error(error?.message ?? "Failed to save preferences"),
  });
};

export const useRefreshAccountCache = (accountId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(API.DASHBOARD.REFRESH_CACHE(accountId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      toast.success("Data refreshed");
    },
    onError: (error) => toast.error(error?.message ?? "Failed to refresh"),
  });
};
