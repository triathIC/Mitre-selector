/**
 * Generate dist/sitemap.xml after the SSG build.
 *
 * For each pre-rendered page (homepage + every MITRE technique) emit a <url>
 * entry. lastmod is derived from the latest `last_tested` value across the
 * KQL mappings linked to that technique (primary or additional), with
 * today's date as fallback for techniques that have no mapping yet.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SITE_URL = "https://mitre.triath.xyz";
const OUTPUT = "dist/sitemap.xml";

interface TechniqueRecord {
  id: string;
}
interface MappingRecord {
  technique_id: string;
  additional_technique_ids?: string[];
  last_tested: string;
}

const cwd = process.cwd();
const techniques = JSON.parse(
  readFileSync(resolve(cwd, "public/data/mitre_techniques.json"), "utf-8")
) as TechniqueRecord[];
const mappings = JSON.parse(
  readFileSync(resolve(cwd, "public/data/kql_mappings.json"), "utf-8")
) as MappingRecord[];

const today = new Date().toISOString().slice(0, 10);

const lastModByTechnique = new Map<string, string>();
for (const m of mappings) {
  const ids = [m.technique_id, ...(m.additional_technique_ids ?? [])];
  for (const id of ids) {
    const existing = lastModByTechnique.get(id);
    if (existing === undefined || m.last_tested > existing) {
      lastModByTechnique.set(id, m.last_tested);
    }
  }
}

const entries: string[] = [];
entries.push(
  `  <url><loc>${SITE_URL}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`
);
for (const t of techniques) {
  const lastmod = lastModByTechnique.get(t.id) ?? today;
  entries.push(
    `  <url><loc>${SITE_URL}/technique/${t.id}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`
  );
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

writeFileSync(resolve(cwd, OUTPUT), xml);
console.log(`[sitemap] ${OUTPUT}: ${entries.length.toString()} URLs`);
