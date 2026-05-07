import { useEffect, useState } from "react";

const STORAGE_KEY = "consent-v1";

type ConsentValue = "granted" | "denied";

interface GtagWindow extends Window {
  gtag?: (...args: unknown[]) => void;
}

function readStored(): ConsentValue | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function applyConsent(value: ConsentValue): void {
  const w = window as GtagWindow;
  if (typeof w.gtag !== "function") return;
  w.gtag("consent", "update", {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
}

/**
 * GDPR/TTDSG consent banner. While no choice has been stored, the GA
 * Consent Mode v2 default ("denied" for every storage purpose) remains
 * active and no analytics cookies / hits are produced. Once the visitor
 * picks Accept or Reject, the choice is persisted in localStorage and
 * forwarded to gtag via consent update; subsequent page loads replay
 * that decision without showing the banner again.
 */
export function ConsentBanner() {
  const [decision, setDecision] = useState<ConsentValue | null | "pending">(
    "pending"
  );

  useEffect(() => {
    const stored = readStored();
    if (stored !== null) {
      applyConsent(stored);
    }
    setDecision(stored);
  }, []);

  if (decision === "pending" || decision !== null) return null;

  const choose = (value: ConsentValue) => () => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // localStorage unavailable — decision will only apply for this session
    }
    applyConsent(value);
    setDecision(value);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-surface-elevated/95 backdrop-blur supports-[backdrop-filter]:bg-surface-elevated/80"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 text-sm text-gray-300 md:flex-row md:items-center md:justify-between">
        <p className="leading-relaxed">
          We use Google Analytics to understand which detections people read.
          No tracking happens until you decide. See the{" "}
          <a href="#impressum" className="text-cyan-400 underline hover:text-cyan-300">
            Impressum
          </a>{" "}
          for details.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={choose("denied")}
            className="rounded border border-white/15 bg-transparent px-4 py-1.5 text-sm text-gray-300 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={choose("granted")}
            className="rounded bg-cyan-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
