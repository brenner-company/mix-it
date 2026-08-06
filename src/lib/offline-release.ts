export const RELEASE_CACHE_PREFIX = 'mix-it-release-';
const LEGACY_RELEASE_CACHE_PREFIX = 'mix-it-';

export function releaseCacheName(version: string): string {
  return `${RELEASE_CACHE_PREFIX}${version}`;
}

export function isReleaseCacheName(cacheName: string): boolean {
  return (
    cacheName.startsWith(RELEASE_CACHE_PREFIX) ||
    cacheName.startsWith(LEGACY_RELEASE_CACHE_PREFIX)
  );
}

export function uniqueReleaseAssets(...assetGroups: readonly (readonly string[])[]): string[] {
  return [...new Set(assetGroups.flat())];
}

export async function installReleaseAtomically(
  populate: () => Promise<void>,
  activate: () => Promise<void>,
  discard: () => Promise<void>
): Promise<void> {
  try {
    await populate();
    await activate();
  } catch (error) {
    await discard();
    throw error;
  }
}
