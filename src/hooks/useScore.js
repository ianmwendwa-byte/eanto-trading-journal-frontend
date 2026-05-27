import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { scoreKeys } from "@/lib/queryKeys";

export const useUserScore = () =>
  useQuery({
    queryKey: scoreKeys.user(),
    queryFn: () => api.get("/api/v1/score/user"),
    staleTime: 10 * 60 * 1000,
  });
