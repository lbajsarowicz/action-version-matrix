import { describe, it, expect } from 'vitest';
import { minorLine, patchNumber, filterLatest, filterAll, filterCustom, filterVersions } from '../src/filter.js';
import type { VersionInfo } from '../src/api.js';

function makeVersion(version: string, php: string[] = ['8.3']): VersionInfo {
  return {
    version,
    releaseDate: '2025-01-01',
    eolDate: '2028-01-01',
    systemRequirements: { php, composer: ['2.9'] },
    isEOLVersion: false,
    isSecureVersion: true,
    isLatestVersion: false,
    isFutureVersion: false,
    statusLabel: 'supported',
  };
}

describe('minorLine', () => {
  it('strips patch suffix', () => {
    expect(minorLine('2.4.7-p8')).toBe('2.4.7');
  });

  it('returns version as-is when no patch suffix', () => {
    expect(minorLine('2.4.8')).toBe('2.4.8');
  });
});

describe('patchNumber', () => {
  it('extracts patch number', () => {
    expect(patchNumber('2.4.7-p8')).toBe(8);
  });

  it('returns 0 for base version', () => {
    expect(patchNumber('2.4.8')).toBe(0);
  });
});

describe('filterLatest', () => {
  it('picks highest patch per minor line', () => {
    const versions: Record<string, VersionInfo> = {
      '2.4.7': makeVersion('2.4.7'),
      '2.4.7-p1': makeVersion('2.4.7-p1'),
      '2.4.7-p8': makeVersion('2.4.7-p8'),
      '2.4.8': makeVersion('2.4.8'),
      '2.4.8-p3': makeVersion('2.4.8-p3'),
    };

    const result = filterLatest(versions);
    expect(result.map(v => v.version)).toEqual(['2.4.7-p8', '2.4.8-p3']);
  });

  it('handles single version per line', () => {
    const versions: Record<string, VersionInfo> = {
      '2.4.6': makeVersion('2.4.6'),
      '2.4.7': makeVersion('2.4.7'),
    };

    const result = filterLatest(versions);
    expect(result.map(v => v.version)).toEqual(['2.4.6', '2.4.7']);
  });

  it('returns empty for empty input', () => {
    expect(filterLatest({})).toEqual([]);
  });
});

describe('filterAll', () => {
  it('returns all versions sorted', () => {
    const versions: Record<string, VersionInfo> = {
      '2.4.8-p3': makeVersion('2.4.8-p3'),
      '2.4.7': makeVersion('2.4.7'),
      '2.4.7-p1': makeVersion('2.4.7-p1'),
    };

    const result = filterAll(versions);
    expect(result.map(v => v.version)).toEqual(['2.4.7', '2.4.7-p1', '2.4.8-p3']);
  });
});

describe('filterCustom', () => {
  it('returns requested versions', () => {
    const versions: Record<string, VersionInfo> = {
      '2.4.7-p8': makeVersion('2.4.7-p8'),
      '2.4.8-p3': makeVersion('2.4.8-p3'),
    };

    const result = filterCustom(versions, ['2.4.8-p3']);
    expect(result.map(v => v.version)).toEqual(['2.4.8-p3']);
  });

  it('throws on unknown version', () => {
    const versions: Record<string, VersionInfo> = {
      '2.4.7-p8': makeVersion('2.4.7-p8'),
    };

    expect(() => filterCustom(versions, ['2.4.9'])).toThrow('Version "2.4.9" not found');
  });

  it('trims whitespace from requested versions', () => {
    const versions: Record<string, VersionInfo> = {
      '2.4.7-p8': makeVersion('2.4.7-p8'),
    };

    const result = filterCustom(versions, [' 2.4.7-p8 ']);
    expect(result).toHaveLength(1);
  });

  it('ignores empty strings', () => {
    const versions: Record<string, VersionInfo> = {
      '2.4.7-p8': makeVersion('2.4.7-p8'),
    };

    const result = filterCustom(versions, ['', '2.4.7-p8', '']);
    expect(result).toHaveLength(1);
  });
});

describe('filterVersions', () => {
  const versions: Record<string, VersionInfo> = {
    '2.4.7': makeVersion('2.4.7'),
    '2.4.7-p8': makeVersion('2.4.7-p8'),
    '2.4.8-p3': makeVersion('2.4.8-p3'),
  };

  it('dispatches to latest', () => {
    const result = filterVersions(versions, 'latest', '');
    expect(result.map(v => v.version)).toEqual(['2.4.7-p8', '2.4.8-p3']);
  });

  it('dispatches to all', () => {
    const result = filterVersions(versions, 'all', '');
    expect(result).toHaveLength(3);
  });

  it('dispatches to custom', () => {
    const result = filterVersions(versions, 'custom', '2.4.7');
    expect(result.map(v => v.version)).toEqual(['2.4.7']);
  });

  it('throws on unknown kind', () => {
    expect(() => filterVersions(versions, 'invalid', '')).toThrow('Unknown kind');
  });
});
