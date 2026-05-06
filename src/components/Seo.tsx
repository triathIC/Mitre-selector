import { Head } from "vite-react-ssg";
import type { KqlMapping, MitreTechnique } from "@/core/models";

const SITE_NAME = "MITRE ATT&CK KQL Explorer";
const SITE_URL = "https://mitre.triath.xyz";
const OG_IMAGE = `${SITE_URL}/og-image.svg`;
const DEFAULT_TITLE = `${SITE_NAME} – Sentinel & Defender XDR Detection Queries`;
const DEFAULT_DESCRIPTION =
  "Interactive MITRE ATT&CK matrix browser with curated KQL queries for Microsoft Sentinel and Defender XDR. Search detections by technique, tactic, platform.";

const MAX_DESCRIPTION = 155;
const FALLBACK_PUBLISHED = "2026-01-01";

function trimDescription(value: string): string {
  if (value.length <= MAX_DESCRIPTION) return value;
  return value.slice(0, MAX_DESCRIPTION - 1).trimEnd() + "…";
}

function pickDates(mappings: KqlMapping[]): { datePublished: string; dateModified: string } {
  const dates = mappings
    .map((m) => m.last_tested)
    .filter((d): d is string => typeof d === "string" && d.length > 0)
    .sort();
  const first = dates[0];
  const last = dates[dates.length - 1];
  const today = new Date().toISOString().slice(0, 10);
  return {
    datePublished: first ?? FALLBACK_PUBLISHED,
    dateModified: last ?? today,
  };
}

interface SeoProps {
  technique?: MitreTechnique;
  mappings?: KqlMapping[];
}

export function Seo({ technique, mappings = [] }: SeoProps) {
  if (!technique) {
    return (
      <Head>
        <title>{DEFAULT_TITLE}</title>
        <meta name="description" content={DEFAULT_DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:title" content={DEFAULT_TITLE} />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={DEFAULT_TITLE} />
        <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Head>
    );
  }

  const title = `${technique.name} (${technique.id}) – KQL Detection | ${SITE_NAME}`;
  const tactic = technique.tactics[0] ?? "MITRE ATT&CK";
  const description = trimDescription(
    `KQL queries und Detection-Logik für ${technique.name} (${technique.id}). Microsoft Sentinel und Defender XDR Hunting Queries, mapped auf MITRE ATT&CK ${tactic}.`
  );
  const url = `${SITE_URL}/technique/${technique.id}`;
  const { datePublished, dateModified } = pickDates(mappings);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${technique.name} – KQL Detection`,
    description,
    url,
    author: { "@type": "Person", name: "Matthias" },
    datePublished,
    dateModified,
  };

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Head>
  );
}
