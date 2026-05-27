import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { notificationKeys } from "@/lib/queryKeys";

export const useUnreadCount = () =>
  useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => api.get("/api/v1/notifications/unread-count"),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch("/api/v1/notifications/read-all"),
    onSuccess: () => {
      queryClient.setQueryData(notificationKeys.unreadCount(), { count: 0 });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
    },
  });
};
