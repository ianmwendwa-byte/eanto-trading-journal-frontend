import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { tradeKeys } from "@/lib/queryKeys";

export const useTradeStats = (filters = {}) =>
  useQuery({
    queryKey: tradeKeys.stats(filters),
    queryFn: () => api.get("/api/v1/trades/stats/overview", { params: filters }),
    staleTime: 2 * 60 * 1000,
  });

export const usePairStats = (filters = {}) =>
  useQuery({
    queryKey: tradeKeys.stats({ ...filters, _type: "pairs" }),
    queryFn: () => api.get("/api/v1/trades/stats/pairs", { params: filters }),
    staleTime: 2 * 60 * 1000,
  });
