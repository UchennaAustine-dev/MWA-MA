/**
 * Custom hook for managing user data - React Native version of useSWR
 * Provides user information and booking data with loading states and auto-refresh
 * Fixed to prevent infinite re-renders
 */
import { fetchUserData } from "@/lib/userAPI";
import { useCallback, useEffect, useRef, useState } from "react";

export const useUserData = (userId: string) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to prevent infinite loops
  const intervalRef = useRef<NodeJS.Timeout | null | any>(null);
  const isMountedRef = useRef(true);
  const lastUserIdRef = useRef<string>("");

  // Fetch data function with proper cleanup
  const fetchData = useCallback(
    async (showLoading = true) => {
      if (!userId || !isMountedRef.current) {
        if (showLoading) setIsLoading(false);
        return;
      }

      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const userData = await fetchUserData(userId);
        if (isMountedRef.current) {
          setData(userData);
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          setError(err.message);
        }
      } finally {
        if (isMountedRef.current && showLoading) {
          setIsLoading(false);
        }
      }
    },
    [userId]
  );

  // Manual refetch function
  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Initial fetch effect
  useEffect(() => {
    // Only fetch if userId changed or it's the first time
    if (userId && userId !== lastUserIdRef.current) {
      lastUserIdRef.current = userId;
      fetchData(true);
    } else if (!userId) {
      setIsLoading(false);
      setData(null);
      setError(null);
    }
  }, [userId, fetchData]);

  // Auto-refresh effect (separate from initial fetch)
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only set up auto-refresh if we have a userId and component is mounted
    if (userId && isMountedRef.current) {
      intervalRef.current = setInterval(() => {
        if (isMountedRef.current && !isLoading) {
          fetchData(false); // Don't show loading for background refresh
        }
      }, 30000); // Increased to 30 seconds to reduce API calls
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, isLoading, fetchData]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { data, isLoading, error, refetch };
};
