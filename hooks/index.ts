import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

/**
 * Custom hook to check authentication status
 * Redirects to login if not authenticated
 */
export function useAuth() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push("/login");
        setIsAuthed(false);
      } else {
        setIsAuthed(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  return { isAuthed, isLoading };
}

/**
 * Custom hook for handling mutations with loading state
 */
export function useMutation<T, E = string>(
  callback: () => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: E) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<E | null>(null);

  const mutate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await callback();
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as E;
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}

/**
 * Custom hook for debounced values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const [previous, setPrevious] = useState<T | undefined>();

  useEffect(() => {
    setPrevious(value);
  }, [value]);

  return previous;
}
