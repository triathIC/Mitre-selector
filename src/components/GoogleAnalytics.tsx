import { useEffect } from "react";

const GA_ID = "G-D3N42GZ6DK";

const INLINE_INIT = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'wait_for_update': 500
});
gtag('js', new Date());
gtag('config', '${GA_ID}');`;

/**
 * Loads gtag.js client-side with Consent Mode v2 default-denied — every
 * GA storage purpose starts denied and must be explicitly granted by a
 * future consent banner via gtag('consent', 'update', {...}). Until the
 * banner ships, no analytics cookies are written and no hits leave the
 * browser, which keeps the site TTDSG/DSGVO-compliant by default.
 *
 * The inline init script is appended BEFORE the async gtag.js loader so
 * that the consent default is registered synchronously before gtag.js
 * starts processing the dataLayer queue.
 *
 * Production-only — `vite dev` traffic is not counted.
 */
export function GoogleAnalytics(): null {
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    interface GtagWindow extends Window {
      __gtagBootstrapped?: boolean;
    }
    const w = window as GtagWindow;
    if (w.__gtagBootstrapped) return;
    w.__gtagBootstrapped = true;

    const init = document.createElement("script");
    init.text = INLINE_INIT;
    document.head.appendChild(init);

    const loader = document.createElement("script");
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(loader);
  }, []);

  return null;
}
