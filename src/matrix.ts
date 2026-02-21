import type { VersionInfo } from './api.js';

/** Services included in matrix output. Order matters for readability. */
const MATRIX_SERVICES = [
  'composer',
  'mysql',
  'mariadb',
  'elasticsearch',
  'opensearch',
  'redis',
  'valkey',
  'rabbitmq',
  'varnish',
  'nginx',
] as const;

export interface MatrixEntry {
  magento: string;
  php: string;
  composer: string;
  mysql: string;
  mariadb: string;
  elasticsearch: string;
  opensearch: string;
  redis: string;
  valkey: string;
  rabbitmq: string;
  varnish: string;
  nginx: string;
}

export interface Matrix {
  include: MatrixEntry[];
}

/**
 * Pick the last (latest) value from an array of version strings, or "" if empty/missing.
 */
function latestOf(values: string[] | undefined): string {
  if (!values || values.length === 0) return '';
  return values[values.length - 1];
}

/**
 * Build a flat matrix from filtered versions.
 * Each version × each PHP version = one entry.
 */
export function buildMatrix(versions: VersionInfo[]): Matrix {
  const include: MatrixEntry[] = [];

  for (const info of versions) {
    const phpVersions = info.systemRequirements.php ?? [];
    const services: Record<string, string> = {};
    for (const svc of MATRIX_SERVICES) {
      services[svc] = latestOf(info.systemRequirements[svc]);
    }

    for (const php of phpVersions) {
      include.push({
        magento: info.version,
        php,
        ...services,
      } as MatrixEntry);
    }
  }

  return { include };
}
