import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { tradeKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";

export const useTagTradeStrategy = (tradeId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch(API.TRADE.TAG_STRATEGY(tradeId), data),
    onSuccess: (res) => {
      const trade = res?.trade;
      if (trade) {
        qc.setQueryData(tradeKeys.detail(tradeId), (old) => {
          if (!old) return old;
          return {
            ...old,
            strategy:             trade.strategy,
            setup:                trade.setup,
            isCompliant:          trade.isCompliant,
            complianceViolations: trade.complianceViolations,
            discipline:           trade.discipline,
          };
        });
      }
      qc.invalidateQueries({ queryKey: tradeKeys.lists() });
      toast.success("Strategy updated — compliance and discipline recalculated");
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Failed to tag strategy"),
  });
};
