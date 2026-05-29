import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { transactionKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";

export const useBalanceHistory = (filters = {}) =>
  useQuery({
    queryKey: transactionKeys.history(filters),
    queryFn: async () => {
      const data = await api.get(API.TRANSACTION.BALANCE_HISTORY, { params: filters });
      console.log("[useBalanceHistory] response:", data);
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });

export const useRecentTransactions = (limit = 5) =>
  useQuery({
    queryKey: transactionKeys.list({ limit }),
    queryFn: async () => {
      const data = await api.get(API.TRANSACTION.BASE, { params: { limit } });
      console.log("[useRecentTransactions] response:", data);
      return data;
    },
    staleTime: 60 * 1000,
  });
