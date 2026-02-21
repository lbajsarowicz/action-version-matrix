import type { VersionInfo } from './api.js';

/**
 * Extract the minor line from a version string.
 * "2.4.7-p8" → "2.4.7", "2.4.8" → "2.4.8"
 */
export function minorLine(version: string): string {
  return version.replace(/-p\d+$/, '');
}

/**
 * Extract the patch number from a version string.
 * "2.4.7-p8" → 8, "2.4.8" → 0
 */
export function patchNumber(version: string): number {
  const match = version.match(/-p(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Group versions by minor line, return the highest patch from each group.
 */
export function filterLatest(versions: Record<string, VersionInfo>): VersionInfo[] {
  const groups = new Map<string, VersionInfo>();

  for (const info of Object.values(versions)) {
    const line = minorLine(info.version);
    const existing = groups.get(line);
    if (!existing || patchNumber(info.version) > patchNumber(existing.version)) {
      groups.set(line, info);
    }
  }

  return [...groups.values()].sort((a, b) => a.version.localeCompare(b.version));
}

/**
 * Return all versions sorted by version string.
 */
export function filterAll(versions: Record<string, VersionInfo>): VersionInfo[] {
  return Object.values(versions).sort((a, b) => a.version.localeCompare(b.version));
}

/**
 * Match user-provided versions against API data. Throws on unknown versions.
 */
export function filterCustom(
  versions: Record<string, VersionInfo>,
  requested: string[],
): VersionInfo[] {
  const result: VersionInfo[] = [];

  for (const req of requested) {
    const trimmed = req.trim();
    if (!trimmed) continue;

    const info = versions[trimmed];
    if (!info) {
      throw new Error(`Version "${trimmed}" not found in supported versions`);
    }
    result.push(info);
  }

  return result.sort((a, b) => a.version.localeCompare(b.version));
}

export function filterVersions(
  versions: Record<string, VersionInfo>,
  kind: string,
  customVersions: string,
): VersionInfo[] {
  switch (kind) {
    case 'latest':
      return filterLatest(versions);
    case 'all':
      return filterAll(versions);
    case 'custom':
      return filterCustom(versions, customVersions.split(','));
    default:
      throw new Error(`Unknown kind: "${kind}". Use "latest", "all", or "custom".`);
  }
}
