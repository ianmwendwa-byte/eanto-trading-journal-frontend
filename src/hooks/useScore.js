import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { scoreKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";

export const useUserScore = () =>
  useQuery({
    queryKey: scoreKeys.user(),
    queryFn: async () => {
      try {
        return await api.get(API.SCORE.USER);
      } catch (error) {
        if (error.status === 404) return null;
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: (failureCount, error) => error?.status !== 404 && failureCount < 3,
  });
