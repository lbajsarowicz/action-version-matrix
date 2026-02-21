import { describe, it, expect } from 'vitest';
import { buildMatrix } from '../src/matrix.js';
import type { VersionInfo } from '../src/api.js';

function makeVersion(version: string, reqs: Record<string, string[]>): VersionInfo {
  return {
    version,
    releaseDate: '2025-01-01',
    eolDate: '2028-01-01',
    systemRequirements: reqs,
    isEOLVersion: false,
    isSecureVersion: true,
    isLatestVersion: false,
    isFutureVersion: false,
    statusLabel: 'supported',
  };
}

describe('buildMatrix', () => {
  it('creates one entry per PHP version', () => {
    const versions = [
      makeVersion('2.4.7-p8', {
        php: ['8.2', '8.3'],
        composer: ['2.9'],
        mysql: ['8.0'],
        mariadb: ['10.11'],
        elasticsearch: ['7.17', '8.17'],
        opensearch: ['2.19'],
        redis: ['7.2'],
        rabbitmq: ['4.1'],
        varnish: ['7.7'],
        nginx: ['1.28'],
      }),
    ];

    const result = buildMatrix(versions);
    expect(result.include).toHaveLength(2);
    expect(result.include[0].php).toBe('8.2');
    expect(result.include[1].php).toBe('8.3');
  });

  it('picks latest (last) service version from arrays', () => {
    const versions = [
      makeVersion('2.4.7-p8', {
        php: ['8.3'],
        elasticsearch: ['7.17', '8.17'],
        rabbitmq: ['3.13', '4.1'],
      }),
    ];

    const result = buildMatrix(versions);
    expect(result.include[0].elasticsearch).toBe('8.17');
    expect(result.include[0].rabbitmq).toBe('4.1');
  });

  it('uses empty string for missing services', () => {
    const versions = [
      makeVersion('2.4.8-p3', {
        php: ['8.4'],
        composer: ['2.9'],
        opensearch: ['3'],
        valkey: ['8'],
      }),
    ];

    const result = buildMatrix(versions);
    const entry = result.include[0];
    expect(entry.elasticsearch).toBe('');
    expect(entry.redis).toBe('');
    expect(entry.mysql).toBe('');
    expect(entry.opensearch).toBe('3');
    expect(entry.valkey).toBe('8');
  });

  it('returns empty include for empty input', () => {
    const result = buildMatrix([]);
    expect(result.include).toEqual([]);
  });

  it('handles version with no PHP versions', () => {
    const versions = [
      makeVersion('2.4.7', { composer: ['2.9'] }),
    ];

    const result = buildMatrix(versions);
    expect(result.include).toEqual([]);
  });

  it('builds full matrix from realistic data', () => {
    const versions = [
      makeVersion('2.4.6-p13', {
        php: ['8.1', '8.2'],
        composer: ['2.2'],
        mysql: ['8.0'],
        mariadb: ['10.11'],
        elasticsearch: ['7.17', '8.17'],
        opensearch: ['2.19'],
        redis: ['7.2'],
        rabbitmq: ['4.1'],
        varnish: ['7.7'],
        nginx: ['1.28'],
        valkey: ['8'],
      }),
      makeVersion('2.4.7-p8', {
        php: ['8.2', '8.3'],
        composer: ['2.9'],
        mysql: ['8.0'],
        mariadb: ['10.11'],
        elasticsearch: ['7.17', '8.17'],
        opensearch: ['2.19'],
        redis: ['7.2'],
        rabbitmq: ['4.1'],
        varnish: ['7.7'],
        nginx: ['1.28'],
        valkey: ['8'],
      }),
      makeVersion('2.4.8-p3', {
        php: ['8.3', '8.4'],
        composer: ['2.9'],
        mysql: ['8.4'],
        mariadb: ['11.4'],
        opensearch: ['3'],
        rabbitmq: ['4.1'],
        valkey: ['8'],
        varnish: ['7.7'],
        nginx: ['1.28'],
      }),
    ];

    const result = buildMatrix(versions);
    // 2 + 2 + 2 = 6 entries
    expect(result.include).toHaveLength(6);

    // Verify first entry (2.4.6-p13 / PHP 8.1)
    expect(result.include[0]).toEqual({
      magento: '2.4.6-p13',
      php: '8.1',
      composer: '2.2',
      mysql: '8.0',
      mariadb: '10.11',
      elasticsearch: '8.17',
      opensearch: '2.19',
      redis: '7.2',
      valkey: '8',
      rabbitmq: '4.1',
      varnish: '7.7',
      nginx: '1.28',
    });

    // Verify last entry (2.4.8-p3 / PHP 8.4) — no elasticsearch, no redis
    const last = result.include[5];
    expect(last.magento).toBe('2.4.8-p3');
    expect(last.php).toBe('8.4');
    expect(last.elasticsearch).toBe('');
    expect(last.redis).toBe('');
  });
});
