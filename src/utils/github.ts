// Hardcoded base URL - never construct dynamically.
export const GITHUB_REPO_URL = "https://github.com/triathIC/Mitre-selector" as const;

export function buildContributionUrl(techniqueId: string, techniqueName: string): string {
  const params = new URLSearchParams({
    template: "new-kql-mapping.yml",
    title: `KQL Contribution: ${techniqueId} ${techniqueName}`,
    labels: "contribution",
  });

  return `${GITHUB_REPO_URL}/issues/new?${params.toString()}`;
}
