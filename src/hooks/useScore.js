import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { scoreKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";
import { useAuthStore } from "@/store/useAuthStore";

export const useUserScore = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: scoreKeys.user(),
    queryFn: async () => {
      try {
        return await api.get(API.SCORE.USER);
      } catch (error) {
        if (error?.status === 404 || error?.response?.status === 404) return null;
        throw error;
      }
    },
    enabled:   isAuthenticated,
    staleTime: 10 * 60 * 1000,
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
        if (error?.status === 404 || error?.response?.status === 404) return null;
        throw error;
      }
    },
    select:    (data) => data?.history ?? data?.data ?? [],
    enabled:   isAuthenticated,
    staleTime: 10 * 60 * 1000,
    retry:     (failureCount, error) => error?.status !== 404 && failureCount < 3,
  });
};
