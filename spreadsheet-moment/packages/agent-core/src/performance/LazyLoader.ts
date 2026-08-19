/**
 * Lazy Loader — Pure utilities only
 *
 * NOTE: React-dependent functions (lazyLoad, createLazyLoaderWithTimeout)
 * have been moved to packages/agent-ui/src/. This file retains only
 * resource-prefetch utilities that don't require React.
 */

// TODO(move-to-agent-ui): React utilities migrated.
// Remaining exports here are DOM-based resource prefetchers intended
// for the browser runtime layer (agent-ui), not the engine core.

/**
 * Preload a resource
 */
export function preloadResource(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload ${url}`));

    document.head.appendChild(link);
  });
}

/**
 * Preload an image
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to preload image ${src}`));
    img.src = src;
  });
}

/**
 * Lazy load images
 */
export function lazyLoadImages(
  selectors: string | string[],
  options?: { threshold?: number; rootMargin?: string }
): Promise<HTMLImageElement[]> {
  // Stub — implementation in agent-ui
  return Promise.resolve([]);
}

/**
 * Create a bundle loader
 */
export function createBundleLoader(
  bundles: Record<string, () => Promise<any>>
): () => Promise<any> {
  return async () => {
    const entries = Object.entries(bundles);
    if (entries.length === 0) return {};
    const [name, loader] = entries[0];
    const mod = await loader();
    return { [name]: mod };
  };
}
