import { useCallback, useEffect, useRef, useState } from 'react';

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseApiResult<T> {
  data: T | null;
  status: ApiStatus;
  error: string | null;
  retry: () => void;
  setData: (next: T | null) => void;
}

/**
 * Generic data-fetching hook with loading/success/error states and retry.
 *
 * Important: implements request sequencing so a slow stale request cannot
 * overwrite a fresher one. Each call to `loader()` increments an internal
 * sequence number; only the latest sequence is allowed to update state.
 */
export function useApi<T>(
  loader: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<ApiStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const sequenceRef = useRef(0);
  const mountedRef = useRef(true);

  const retry = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const mySequence = ++sequenceRef.current;
    setStatus('loading');
    setError(null);
    loader()
      .then((result) => {
        if (!mountedRef.current) return;
        if (mySequence !== sequenceRef.current) return;
        setData(result);
        setStatus('success');
      })
      .catch((err: Error) => {
        if (!mountedRef.current) return;
        if (mySequence !== sequenceRef.current) return;
        setError(err?.message ?? 'Something went wrong');
        setStatus('error');
      });
  }, [...deps, tick]);

  return { data, status, error, retry, setData };
}