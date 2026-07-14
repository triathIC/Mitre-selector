import { track } from "@vercel/analytics";

export type AnalyticsEvent =
  | { name: "technique_opened"; props: { technique_id: string; tactic: string } }
  | { name: "kql_copied"; props: { technique_id: string; query_name?: string } }
  | {
      name: "external_link_clicked";
      props: { destination: "mitre" | "github" | "docs" | "other"; url: string };
    }
  | { name: "search_performed"; props: { query_length: number; result_count: number } };

/**
 * Type-safe Vercel Analytics tracking. Never throws — analytics must never
 * break the app. Failures are silently swallowed in prod, logged in dev.
 */
export function trackEvent(event: AnalyticsEvent): void {
  try {
    track(event.name, event.props);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("[analytics] tracking failed", err);
    }
  }
}

/**
 * Map an external URL to one of the analytics destination categories.
 */
export function destinationFromUrl(
  url: string
): "mitre" | "github" | "docs" | "other" {
  try {
    const host = new URL(url).hostname;
    if (host.endsWith("attack.mitre.org")) return "mitre";
    if (host.endsWith("github.com")) return "github";
    if (host.endsWith("learn.microsoft.com")) return "docs";
    return "other";
  } catch {
    return "other";
  }
}

/**
 * Convenience for the common external-link click pattern: derive destination,
 * fire the analytics event. Use in `onClick` of <a> tags.
 */
export function trackExternalClick(url: string): void {
  trackEvent({
    name: "external_link_clicked",
    props: { destination: destinationFromUrl(url), url },
  });
}

/**
 * Tiny debounce — replaces a lodash dep we deliberately don't add.
 * Returns the debounced function plus a cancel handle for cleanup.
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number
): { call: (...args: Args) => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return {
    call(...args: Args) {
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        fn(...args);
      }, waitMs);
    },
    cancel() {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}
