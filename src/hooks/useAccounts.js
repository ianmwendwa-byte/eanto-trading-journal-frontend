import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { accountKeys } from "@/lib/queryKeys";

export const useAccounts = (filters = {}) =>
  useQuery({
    queryKey: accountKeys.list(filters),
    queryFn: () => api.get("/api/v1/accounts", { params: filters }),
    staleTime: 5 * 60 * 1000,
  });
