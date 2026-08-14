import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  EnrolleeNotification,
  fetchNotifications,
  markNotificationsRead,
} from "@/lib/enrolleeApi";
import { resolveNotificationRoute } from "@/lib/enrolleeAccess";
import { router } from "expo-router";
import { Bell, CheckCheck } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<EnrolleeNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError("");
    try {
      const items = await fetchNotifications();
      setNotifications(
        [...items].sort((a, b) => {
          if (Boolean(a.isRead) !== Boolean(b.isRead)) return a.isRead ? 1 : -1;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load notifications");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadIds = useMemo(
    () => notifications.filter((item) => !item.isRead).map((item) => item.id),
    [notifications]
  );

  const markAllRead = async () => {
    if (unreadIds.length === 0) return;
    const previous = notifications;
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    try {
      await markNotificationsRead(unreadIds);
    } catch (err) {
      setNotifications(previous);
      setError(err instanceof Error ? err.message : "Unable to update notifications");
    }
  };

  const openNotification = async (notification: EnrolleeNotification) => {
    if (!notification.isRead) {
      setNotifications((items) =>
        items.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item
        )
      );
      try {
        await markNotificationsRead([notification.id]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to update notification");
        return;
      }
    }

    const target = resolveNotificationRoute(notification.clickUrl);
    if (target) router.push(target as never);
  };

  return (
    <VStack className="flex-1 bg-slate-50">
      <ScreenHeader
        eyebrow="Updates"
        title="Notifications"
        description="Keep track of appointments, dependent visits, approvals, and account activity."
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerClassName="gap-3 px-5 py-5"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void load(true)} />
        }
      >
        <HStack className="items-center justify-between">
          <Text className="font-semibold text-typography-700">
            {unreadIds.length} unread
          </Text>
          <TouchableOpacity
            onPress={() => void markAllRead()}
            disabled={unreadIds.length === 0}
            className="flex-row items-center gap-2 rounded-full bg-primary-50 px-4 py-3"
          >
            <CheckCheck color="#1d4ed8" size={17} />
            <Text className="text-sm font-semibold text-primary-800">Mark all read</Text>
          </TouchableOpacity>
        </HStack>

        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error ? (
          <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
            <Text className="text-sm text-error-700">{error}</Text>
          </Box>
        ) : null}
        {!isLoading && notifications.length === 0 ? (
          <Box className="items-center rounded-[24px] border border-dashed border-slate-200 bg-white p-8">
            <Bell color="#64748b" size={30} />
            <Text className="mt-3 font-semibold text-typography-900">You are all caught up</Text>
            <Text className="mt-1 text-center text-sm text-typography-500">
              New healthcare and account updates will appear here.
            </Text>
          </Box>
        ) : null}

        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            onPress={() => void openNotification(notification)}
            activeOpacity={0.8}
          >
            <Box
              className={`rounded-[24px] border p-5 ${
                notification.isRead
                  ? "border-slate-100 bg-white"
                  : "border-primary-200 bg-primary-50"
              }`}
            >
              <HStack className="items-start" space="md">
                <Box className="relative h-11 w-11 items-center justify-center rounded-2xl bg-white">
                  <Bell color="#1d4ed8" size={20} />
                  {!notification.isRead ? (
                    <Box className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-primary-50 bg-orange-500" />
                  ) : null}
                </Box>
                <VStack className="flex-1" space="xs">
                  <Text className="font-bold text-typography-900">
                    {notification.title || notification.source || "New notification"}
                  </Text>
                  <Text className="text-sm leading-5 text-typography-600">
                    {notification.message || notification.body || "You have a new account update."}
                  </Text>
                  <Text className="text-xs text-typography-400">
                    {formatDate(notification.createdAt)}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </VStack>
  );
}
