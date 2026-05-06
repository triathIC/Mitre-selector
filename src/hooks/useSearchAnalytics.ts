import { useEffect, useMemo } from "react";
import { trackEvent, debounce } from "@/lib/analytics";

/**
 * Fires a debounced `search_performed` analytics event when the search query
 * changes. Only the QUERY LENGTH and result count are sent — never the query
 * string itself, to avoid leaking user input to analytics.
 *
 * - Debounced 1000ms (one event after the user stops typing, not per keystroke)
 * - Only tracks queries with length >= 3 (ignores noise)
 */
export function useSearchAnalytics(query: string, resultCount: number): void {
  const debounced = useMemo(
    () =>
      debounce<[string, number]>((q, count) => {
        trackEvent({
          name: "search_performed",
          props: { query_length: q.length, result_count: count },
        });
      }, 1000),
    []
  );

  useEffect(() => {
    if (query.length < 3) {
      debounced.cancel();
      return;
    }
    debounced.call(query, resultCount);
  }, [query, resultCount, debounced]);

  useEffect(() => {
    return () => {
      debounced.cancel();
    };
  }, [debounced]);
}
