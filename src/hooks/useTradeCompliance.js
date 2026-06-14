import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { tradeKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";

export const useCheckCompliance = (tradeId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(API.TRADE.COMPLIANCE(tradeId)),
    onSuccess: (response) => {
      qc.setQueryData(tradeKeys.detail(tradeId), (old) => {
        if (!old) return old;
        return {
          ...old,
          isCompliant:          response?.isCompliant          ?? old.isCompliant,
          complianceViolations: response?.violations           ?? old.complianceViolations,
        };
      });
      qc.invalidateQueries({ queryKey: tradeKeys.lists() });
      toast.success("Compliance checked");
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Failed to check compliance"),
  });
};

// Does NOT persist to trade cache — returns data for local component state only
export const useCheckDiscipline = (tradeId) => {
  return useMutation({
    mutationFn: () => api.post(API.TRADE.DISCIPLINE(tradeId)),
    onError: () => {},
  });
};
