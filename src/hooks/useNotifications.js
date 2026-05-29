import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { notificationKeys } from "@/lib/queryKeys";
import { API } from "@/constants/api";
import { useAuthStore } from "@/store/useAuthStore";

// ── Unread count ──────────────────────────────────────────────
export const useUnreadCount = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:        notificationKeys.unreadCount(),
    queryFn:         () => api.get(API.NOTIFICATION.UNREAD_COUNT),
    select:          (data) => data?.data?.count ?? 0,
    staleTime:       30 * 1000,
    refetchInterval: 30 * 1000,
    enabled:         isAuthenticated,
  });
};

// ── Notification list ─────────────────────────────────────────
export const useNotifications = (filters = {}) => {
  const { isAuthenticated } = useAuthStore();
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  return useQuery({
    queryKey:        notificationKeys.list(cleanFilters),
    queryFn:         () => api.get(API.NOTIFICATION.BASE, { params: cleanFilters }),
    select:          (data) => ({
      notifications: data?.data?.data         ?? [],
      pagination:    data?.data?.pagination   ?? {
        total: 0, page: 1, pages: 0, limit: 20,
      },
    }),
    staleTime:       30 * 1000,
    refetchInterval: 60 * 1000,
    enabled:         isAuthenticated,
  });
};

// ── Mark single as read ───────────────────────────────────────
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(API.NOTIFICATION.READ(id)),
    onMutate: () => {
      queryClient.setQueryData(
        notificationKeys.unreadCount(),
        (old) => Math.max(0, (old ?? 0) - 1)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
    },
  });
};

// ── Mark all as read ──────────────────────────────────────────
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(API.NOTIFICATION.READ_ALL),
    onSuccess: () => {
      queryClient.setQueryData(notificationKeys.unreadCount(), 0);
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
      toast.success("All notifications marked as read");
    },
    onError: (error) => toast.error(error?.response?.data?.message ?? "Failed to mark all as read"),
  });
};

// ── Delete notification ───────────────────────────────────────
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(API.NOTIFICATION.DELETE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
      toast.success("Notification deleted");
    },
    onError: (error) => toast.error(error?.response?.data?.message ?? "Failed to delete notification"),
  });
};

// ── Notification preferences ──────────────────────────────────
export const useNotificationPreferences = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey:  notificationKeys.preferences(),
    queryFn:   () => api.get(API.NOTIFICATION.PREFERENCES),
    select:    (data) => data?.data?.data ?? null,
    staleTime: 10 * 60 * 1000,
    enabled:   isAuthenticated,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch(API.NOTIFICATION.PREFERENCES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
      toast.success("Preferences updated");
    },
    onError: (error) => toast.error(error?.response?.data?.message ?? "Failed to update preferences"),
  });
};
