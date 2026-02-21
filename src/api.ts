export interface SystemRequirements {
  [service: string]: string[];
}

export interface VersionInfo {
  version: string;
  releaseDate: string;
  eolDate: string;
  systemRequirements: SystemRequirements;
  isEOLVersion: boolean;
  isSecureVersion: boolean;
  isLatestVersion: boolean;
  isFutureVersion: boolean;
  statusLabel: string;
}

export interface ApiResponse {
  data: Record<string, VersionInfo>;
}

const BASE_URL = 'https://magento.watch/api/v1';

export async function fetchSupportedVersions(distribution: string): Promise<Record<string, VersionInfo>> {
  const url = `${BASE_URL}/${encodeURIComponent(distribution)}/versions/supported`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15_000),
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`magento.watch API returned ${response.status}: ${response.statusText}`);
  }

  const body: ApiResponse = await response.json();
  return body.data;
}
