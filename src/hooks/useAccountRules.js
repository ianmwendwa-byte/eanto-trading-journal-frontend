import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { accountKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";

// Track rules are embedded in account.trackRules[] — reads use useAccount(id)

export const useAddRule = (accountId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(API.ACCOUNT.RULES(accountId), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.detail(accountId) });
      toast.success("Rule added");
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Failed to add rule"),
  });
};

export const useUpdateRule = (accountId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, data }) => api.patch(API.ACCOUNT.RULE(accountId, ruleId), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.detail(accountId) });
      toast.success("Rule updated");
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Failed to update rule"),
  });
};

export const useDeleteRule = (accountId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ruleId) => api.delete(API.ACCOUNT.RULE(accountId, ruleId)),
    onMutate: async (ruleId) => {
      await qc.cancelQueries({ queryKey: accountKeys.detail(accountId) });
      const prev = qc.getQueryData(accountKeys.detail(accountId));
      qc.setQueryData(accountKeys.detail(accountId), (old) => {
        if (!old) return old;
        return { ...old, trackRules: (old.trackRules ?? []).filter((r) => r._id !== ruleId) };
      });
      return { prev };
    },
    onError: (err, _, ctx) => {
      if (ctx?.prev) qc.setQueryData(accountKeys.detail(accountId), ctx.prev);
      toast.error(err?.response?.data?.message ?? "Failed to delete rule");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: accountKeys.detail(accountId) }),
  });
};

export const useToggleRule = (accountId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ruleId) => api.patch(API.ACCOUNT.RULE_TOGGLE(accountId, ruleId)),
    onMutate: async (ruleId) => {
      await qc.cancelQueries({ queryKey: accountKeys.detail(accountId) });
      const prev = qc.getQueryData(accountKeys.detail(accountId));
      qc.setQueryData(accountKeys.detail(accountId), (old) => {
        if (!old) return old;
        return {
          ...old,
          trackRules: (old.trackRules ?? []).map((r) =>
            r._id === ruleId ? { ...r, enabled: !r.enabled } : r
          ),
        };
      });
      return { prev };
    },
    onError: (err, _, ctx) => {
      if (ctx?.prev) qc.setQueryData(accountKeys.detail(accountId), ctx.prev);
      toast.error("Failed to toggle rule");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: accountKeys.detail(accountId) }),
  });
};

export const useEvaluateRules = (accountId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(API.ACCOUNT.RULES_EVALUATE(accountId)),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: accountKeys.detail(accountId) });
      const evaluated  = res?.evaluated  ?? 0;
      const violations = res?.violations ?? 0;
      toast.success(
        `${evaluated} rule${evaluated !== 1 ? "s" : ""} evaluated — ${violations} violation${violations !== 1 ? "s" : ""} found`
      );
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Failed to evaluate rules"),
  });
};

export const useUpdatePropRules = (accountId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch(API.ACCOUNT.PROP_RULES(accountId), data),
    onSuccess: (response) => {
      qc.setQueryData(accountKeys.detail(accountId), (old) => {
        if (!old) return old;
        return { ...old, propRules: response?.propRules ?? old.propRules };
      });
      toast.success("Prop rules updated");
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Failed to update prop rules"),
  });
};

export const useGraduateAccount = (accountId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(API.ACCOUNT.GRADUATE(accountId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.detail(accountId) });
      toast.success("Graduation initiated");
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Failed to graduate account"),
  });
};
