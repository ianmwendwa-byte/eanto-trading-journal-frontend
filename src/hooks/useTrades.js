import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import api from "@/lib/axios";
import { tradeKeys, accountKeys, scoreKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";
import { useAuthStore } from "@/store/useAuthStore";

const SORT_MAP = {
  closedAt_desc:    { sortBy: "closedAt",   sortOrder: "desc" },
  closedAt_asc:     { sortBy: "closedAt",   sortOrder: "asc"  },
  pnl_desc:         { sortBy: "pnl",        sortOrder: "desc" },
  pnl_asc:          { sortBy: "pnl",        sortOrder: "asc"  },
  realizedRR_desc:  { sortBy: "realizedRR", sortOrder: "desc" },
  pair_asc:         { sortBy: "pair",       sortOrder: "asc"  },
};

// ── List trades with filters + pagination ──────────────────────
export const useTrades = (filters = {}) => {
  const { isAuthenticated } = useAuthStore();
  const {
    page = 1, limit = 20, accountId, pair, direction, outcome,
    session, weekday, dateFrom, dateTo, sort = "closedAt_desc", search,
  } = filters;
  const { sortBy, sortOrder } = SORT_MAP[sort] ?? SORT_MAP.closedAt_desc;

  const params = {
    page, limit, sortBy, sortOrder,
    ...(accountId ? { accountId } : {}),
    ...(pair      ? { pair }      : {}),
    ...(direction ? { direction } : {}),
    ...(outcome   ? { outcome }   : {}),
    ...(session   ? { session }   : {}),
    ...(weekday   ? { weekday }   : {}),
    ...(dateFrom  ? { dateFrom }  : {}),
    ...(dateTo    ? { dateTo }    : {}),
    ...(search    ? { search }    : {}),
  };

  return useQuery({
    queryKey: tradeKeys.list(filters),
    queryFn:  () => api.get(API.TRADE.BASE, { params }),
    select: (data) => ({
      trades:     data?.trades     ?? [],
      pagination: {
        total:       data?.pagination?.total  ?? 0,
        page:        data?.pagination?.page   ?? 1,
        limit:       data?.pagination?.limit  ?? 20,
        totalPages:  data?.pagination?.pages  ?? 0,
        hasNextPage: (data?.pagination?.page ?? 1) < (data?.pagination?.pages ?? 0),
        hasPrevPage: (data?.pagination?.page ?? 1) > 1,
      },
    }),
    enabled:         isAuthenticated,
    staleTime:       60 * 1000,
    placeholderData: (prev) => prev,
  });
};

// ── Calendar: full month of trades ────────────────────────────
export const useCalendarTrades = (year, month, accountId) => {
  const { isAuthenticated } = useAuthStore();
  const first   = new Date(year, month, 1);
  const last    = new Date(year, month + 1, 0);
  const dateFrom = format(first, "yyyy-MM-dd");
  const dateTo   = format(last,  "yyyy-MM-dd");

  return useQuery({
    queryKey: tradeKeys.calendar({ year, month, accountId }),
    queryFn:  () => api.get(API.TRADE.BASE, {
      params: { dateFrom, dateTo, limit: 500, page: 1, ...(accountId ? { accountId } : {}) },
    }),
    select:    (data) => data?.trades ?? [],
    enabled:   isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

// ── Single trade ───────────────────────────────────────────────
export const useTrade = (id) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:  tradeKeys.detail(id),
    queryFn:   () => api.get(API.TRADE.DETAIL(id)),
    select:    (data) => data?.trade ?? data?.data ?? null,
    enabled:   !!id && isAuthenticated,
    staleTime: 30 * 1000,
  });
};

// ── Stats: overview ────────────────────────────────────────────
export const useTradeStats = (filters = {}) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:  tradeKeys.stats({ ...filters, _type: "overview" }),
    queryFn:   () => api.get(API.TRADE.STATS_OVERVIEW, { params: filters }),
    select:    (data) => data?.data ?? null,
    enabled:   isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
};

// ── Stats: pairs ───────────────────────────────────────────────
export const useTradePairStats = (filters = {}) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:  tradeKeys.stats({ ...filters, _type: "pairs" }),
    queryFn:   () => api.get(API.TRADE.STATS_PAIRS, { params: filters }),
    select:    (data) => data?.data ?? [],
    enabled:   isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
};

// ── Stats: sessions ────────────────────────────────────────────
export const useTradeSessionStats = (filters = {}) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:  tradeKeys.stats({ ...filters, _type: "sessions" }),
    queryFn:   () => api.get(API.TRADE.STATS_SESSIONS, { params: filters }),
    select:    (data) => data?.data ?? [],
    enabled:   isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
};

// ── Stats: weekdays ────────────────────────────────────────────
export const useTradeWeekdayStats = (filters = {}) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:  tradeKeys.stats({ ...filters, _type: "weekdays" }),
    queryFn:   () => api.get(API.TRADE.STATS_WEEKDAYS, { params: filters }),
    select:    (data) => data?.data ?? [],
    enabled:   isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
};

// ── Stats: monthly ─────────────────────────────────────────────
export const useTradeMonthlyStats = (filters = {}) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:  tradeKeys.stats({ ...filters, _type: "monthly" }),
    queryFn:   () => api.get(API.TRADE.STATS_MONTHLY, { params: filters }),
    select:    (data) => data?.data ?? [],
    enabled:   isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
};

// ── Create trade ───────────────────────────────────────────────
export const useCreateTrade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(API.TRADE.BASE, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tradeKeys.lists() });
      qc.invalidateQueries({ queryKey: ["trades", "calendar"] });
      qc.invalidateQueries({ queryKey: accountKeys.all() });
      qc.invalidateQueries({ queryKey: scoreKeys.user() });
      toast.success("Trade added successfully");
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message ?? error.message ?? "Failed to add trade"),
  });
};

// ── Update trade (journal fields only) ────────────────────────
export const useUpdateTrade = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch(API.TRADE.DETAIL(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tradeKeys.lists() });
      qc.invalidateQueries({ queryKey: tradeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ["trades", "calendar"] });
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message ?? error.message ?? "Failed to update trade"),
  });
};

// ── Delete trade ───────────────────────────────────────────────
export const useDeleteTrade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(API.TRADE.DETAIL(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tradeKeys.lists() });
      qc.invalidateQueries({ queryKey: ["trades", "calendar"] });
      qc.invalidateQueries({ queryKey: accountKeys.all() });
      toast.success("Trade deleted");
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message ?? error.message ?? "Failed to delete trade"),
  });
};
