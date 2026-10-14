/**
 * A small data-loading hook. The app has a handful of screens and one source of
 * data, so a full caching library would be more machinery than the problem
 * needs; this covers loading, errors, pull-to-refresh and refetching when a
 * screen comes back into focus.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

export interface QueryResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refreshing: boolean;
  reload: () => void;
  refresh: () => Promise<void>;
}

export function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
  options: { refetchOnFocus?: boolean } = {},
): QueryResult<T> {
  const { refetchOnFocus = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Keeps the latest fetcher without making it a dependency of the effect.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // A result that arrives after the screen has moved on must be discarded.
  const generation = useRef(0);

  const run = useCallback(async (mode: 'initial' | 'refresh') => {
    const ticket = ++generation.current;
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);

    try {
      const result = await fetcherRef.current();
      if (ticket !== generation.current) return;
      setData(result);
      setError(null);
    } catch (caught) {
      if (ticket !== generation.current) return;
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      if (ticket === generation.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void run('initial');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Coming back from "add expense" should show the new balance, not the old one.
  useFocusEffect(
    useCallback(() => {
      if (!refetchOnFocus) return;
      if (generation.current > 0) void run('refresh');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps),
  );

  return {
    data,
    error,
    loading,
    refreshing,
    reload: () => void run('initial'),
    refresh: () => run('refresh'),
  };
}
