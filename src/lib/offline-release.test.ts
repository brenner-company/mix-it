import { describe, expect, it } from 'vitest';

import {
  installReleaseAtomically,
  isReleaseCacheName,
  releaseCacheName,
  uniqueReleaseAssets
} from './offline-release';

describe('offline release cache helpers', () => {
  it('names each release separately and only recognizes Mix-it release caches', () => {
    expect(releaseCacheName('abc123')).toBe('mix-it-release-abc123');
    expect(isReleaseCacheName('mix-it-release-abc123')).toBe(true);
    expect(isReleaseCacheName('mix-it-1786009143467')).toBe(true);
    expect(isReleaseCacheName('other-app-cache')).toBe(false);
  });

  it('deduplicates the build, static, and route assets in a release', () => {
    expect(uniqueReleaseAssets(['/a.js', '/shared.js'], ['/shared.js', '/manifest.webmanifest'], ['/'])).toEqual([
      '/a.js',
      '/shared.js',
      '/manifest.webmanifest',
      '/'
    ]);
  });

  it('does not activate an incomplete release and discards it after a precache failure', async () => {
    const calls: string[] = [];

    await expect(
      installReleaseAtomically(
        async () => {
          calls.push('populate');
          throw new Error('asset unavailable');
        },
        async () => {
          calls.push('activate');
        },
        async () => {
          calls.push('discard');
        }
      )
    ).rejects.toThrow('asset unavailable');

    expect(calls).toEqual(['populate', 'discard']);
  });
});
