import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";
import { useSearchHistoryStore } from "@/lib/store/searchHistoryStore";
import { useCallback, useEffect, useState } from "react";

export function useFetchSearchHistory() {
  const { user } = useAuthStore();
  const { setSearchHistory } = useSearchHistoryStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSearchHistory = useCallback(
    async (providerId?: string) => {
      try {
        setLoading(true);
        setError(null);

        const id = providerId || user?.id;

        if (!id) {
          setError("Provider ID not found");
          return;
        }

        const response = await apiClient(
          `/provider/search/history?provider_id=${id}`
        );

        if (response.data) {
          setSearchHistory(response.data);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch search history";
        setError(errorMessage);
        console.error("Error fetching search history:", err);
      } finally {
        setLoading(false);
      }
    },
    [user?.id, setSearchHistory]
  );

  useEffect(() => {
    if (user?.id) {
      fetchSearchHistory();
    }
  }, [user?.id, fetchSearchHistory]);

  return {
    loading,
    error,
    fetchSearchHistory,
  };
}
