import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { transactionKeys } from "@/lib/queryKeys";

export const useBalanceHistory = (filters = {}) =>
  useQuery({
    queryKey: transactionKeys.history(filters),
    queryFn: () => api.get("/api/v1/transactions/balance-history", { params: filters }),
    staleTime: 2 * 60 * 1000,
  });

export const useRecentTransactions = (limit = 5) =>
  useQuery({
    queryKey: transactionKeys.list({ limit, sortBy: "createdAt", sortOrder: "desc" }),
    queryFn: () =>
      api.get("/api/v1/transactions", {
        params: { limit, sortBy: "createdAt", sortOrder: "desc" },
      }),
    staleTime: 60 * 1000,
  });
