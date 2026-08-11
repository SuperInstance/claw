/**
 * Code Splitter Tests
 * Testing dynamic imports and code splitting functionality
 */

import { CodeSplitter } from '../../src/utils/codeSplitter';

// Mock dynamic imports
jest.mock('../../src/utils/codeSplitter', () => {
  const original = jest.requireActual('../../src/utils/codeSplitter');
  return {
    ...original,
    dynamicImport: jest.fn()
  };
});

describe('CodeSplitter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('Dynamic Imports', () => {
    it('should load component dynamically', async () => {
      const mockComponent = () => <div>Dynamic Component</div>;
      (CodeSplitter.dynamicImport as jest.Mock).mockResolvedValue({
        default: mockComponent
      });

      const result = await CodeSplitter.loadComponent('TestComponent');
      expect(result).toBeDefined();
    });

    it('should handle import errors gracefully', async () => {
      (CodeSplitter.dynamicImport as jest.Mock).mockRejectedValue(
        new Error('Failed to load module')
      );

      await expect(CodeSplitter.loadComponent('BrokenComponent')).rejects.toThrow();
    });

    it('should cache loaded components', async () => {
      const mockComponent = () => <div>Cached Component</div>;
      (CodeSplitter.dynamicImport as jest.Mock).mockResolvedValue({
        default: mockComponent
      });

      await CodeSplitter.loadComponent('CachedComponent');
      await CodeSplitter.loadComponent('CachedComponent');

      expect(CodeSplitter.dynamicImport).toHaveBeenCalledTimes(1);
    });

    it('should preload components', async () => {
      const mockComponent = () => <div>Preloaded Component</div>;
      (CodeSplitter.dynamicImport as jest.Mock).mockResolvedValue({
        default: mockComponent
      });

      await CodeSplitter.preloadComponent('PreloadComponent');

      expect(CodeSplitter.dynamicImport).toHaveBeenCalled();
    });
  });

  describe('Route-based Splitting', () => {
    it('should split routes by page', async () => {
      const routes = [
        { path: '/home', component: 'HomePage' },
        { path: '/about', component: 'AboutPage' },
        { path: '/contact', component: 'ContactPage' }
      ];

      const mockComponent = () => <div>Page</div>;
      (CodeSplitter.dynamicImport as jest.Mock).mockResolvedValue({
        default: mockComponent
      });

      const loadedRoutes = await CodeSplitter.splitRoutes(routes);

      expect(loadedRoutes).toHaveLength(routes.length);
    });

    it('should load route component on navigation', async () => {
      const mockComponent = () => <div>Route Component</div>;
      (CodeSplitter.dynamicImport as jest.Mock).mockResolvedValue({
        default: mockComponent
      });

      await CodeSplitter.loadRoute('/about');

      expect(CodeSplitter.dynamicImport).toHaveBeenCalledWith('AboutPage');
    });
  });

  describe('Component Lazy Loading', () => {
    it('should create lazy component wrapper', () => {
      const mockComponent = () => <div>Lazy Component</div>;
      const LazyComponent = CodeSplitter.lazy(() =>
        Promise.resolve({ default: mockComponent }))
      ;

      expect(LazyComponent).toBeDefined();
    });

    it('should handle lazy component loading state', async () => {
      const mockComponent = () => <div>Lazy Component</div>;
      let resolveLoad: any;
      const loadPromise = new Promise(resolve => {
        resolveLoad = resolve;
      });

      const LazyComponent = CodeSplitter.lazy(() =>
        loadPromise.then(() => ({ default: mockComponent }))
      );

      // Component should be in loading state initially
      expect(LazyComponent).toBeDefined();

      // Resolve the load
      resolveLoad();
      await loadPromise;
    });

    it('should handle lazy component error state', async () => {
      const LazyComponent = CodeSplitter.lazy(() =>
        Promise.reject(new Error('Load failed'))
      );

      expect(LazyComponent).toBeDefined();
    });
  });

  describe('Prefetching', () => {
    it('should prefetch components on hover', async () => {
      const mockComponent = () => <div>Prefetched Component</div>;
      (CodeSplitter.dynamicImport as jest.Mock).mockResolvedValue({
        default: mockComponent
      });

      await CodeSplitter.prefetchComponent('HoverComponent');

      expect(CodeSplitter.dynamicImport).toHaveBeenCalled();
    });

    it('should prefetch components on viewport intersection', async () => {
      const mockComponent = () => <div>Viewport Component</div>;
      (CodeSplitter.dynamicImport as jest.Mock).mockResolvedValue({
        default: mockComponent
      });

      await CodeSplitter.prefetchOnIntersection('ViewportComponent');

      expect(CodeSplitter.dynamicImport).toHaveBeenCalled();
    });

    it('should cancel prefetch on unmount', async () => {
      const mockComponent = () => <div>Cancel Component</div>;
      (CodeSplitter.dynamicImport as jest.Mock).mockResolvedValue({
        default: mockComponent
      });

      const prefetchPromise = CodeSplitter.prefetchComponent('CancelComponent');
      CodeSplitter.cancelPrefetch('CancelComponent');

      await expect(prefetchPromise).resolves.toBeDefined();
    });
  });

  describe('Bundle Analysis', () => {
    it('should analyze bundle size', () => {
      const bundleInfo = CodeSplitter.analyzeBundle({
        name: 'main',
        size: 1024000,
        chunks: ['main', 'vendor', 'common']
      });

      expect(bundleInfo.size).toBe(1024000);
      expect(bundleInfo.sizeFormatted).toBe('1 MB');
    });

    it('should identify large bundles', () => {
      const largeBundles = CodeSplitter.identifyLargeBundles([
        { name: 'main', size: 2048000 },
        { name: 'vendor', size: 512000 },
        { name: 'common', size: 256000 }
      ], 1000000);

      expect(largeBundles).toHaveLength(1);
      expect(largeBundles[0].name).toBe('main');
    });

    it('should suggest splitting strategies', () => {
      const suggestions = CodeSplitter.getSuggestions({
        bundles: [
          { name: 'main', size: 3096000 },
          { name: 'vendor', size: 1024000 }
        ],
        threshold: 1000000
      });

      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should retry failed imports', async () => {
      const mockComponent = () => <div>Retry Component</div>;
      (CodeSplitter.dynamicImport as jest.Mock)
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValue({ default: mockComponent });

      const result = await CodeSplitter.loadComponentWithRetry('RetryComponent', 2);

      expect(result).toBeDefined();
      expect(CodeSplitter.dynamicImport).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      (CodeSplitter.dynamicImport as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await expect(
        CodeSplitter.loadComponentWithRetry('FailComponent', 3)
      ).rejects.toThrow();

      expect(CodeSplitter.dynamicImport).toHaveBeenCalledTimes(3);
    });

    it('should handle timeout errors', async () => {
      (CodeSplitter.dynamicImport as jest.Mock).mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 6000)
        )
      );

      await expect(
        CodeSplitter.loadComponentWithTimeout('SlowComponent', 5000)
      ).rejects.toThrow();
    });
  });

  describe('Performance Monitoring', () => {
    it('should track load times', async () => {
      const mockComponent = () => <div>Tracked Component</div>;
      (CodeSplitter.dynamicImport as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() =>
          resolve({ default: mockComponent }), 100)
        )
      );

      const startTime = Date.now();
      await CodeSplitter.loadComponent('TrackedComponent');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeGreaterThanOrEqual(100);
    });

    it('should log slow components', async () => {
      const mockComponent = () => <div>Slow Component</div>;
      (CodeSplitter.dynamicImport as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() =>
          resolve({ default: mockComponent }), 1000)
        )
      );

      const slowComponents = await CodeSplitter.identifySlowComponents([
        'SlowComponent'
      ], 500);

      expect(slowComponents).toContain('SlowComponent');
    });
  });

  describe('Cache Management', () => {
    it('should clear component cache', async () => {
      const mockComponent = () => <div>Cached Component</div>;
      (CodeSplitter.dynamicImport as jest.Mock).mockResolvedValue({
        default: mockComponent
      });

      await CodeSplitter.loadComponent('CachedComponent');
      CodeSplitter.clearCache();

      await CodeSplitter.loadComponent('CachedComponent');

      expect(CodeSplitter.dynamicImport).toHaveBeenCalledTimes(2);
    });

    it('should preload critical components', async () => {
      const mockComponent = () => <div>Critical Component</div>;
      (CodeSplitter.dynamicImport as jest.Mock).mockResolvedValue({
        default: mockComponent
      });

      const critical = ['Header', 'Footer', 'Navigation'];
      await CodeSplitter.preloadCritical(critical);

      expect(CodeSplitter.dynamicImport).toHaveBeenCalledTimes(critical.length);
    });
  });

  describe('Webpack Integration', () => {
    it('should work with webpack magic comments', async () => {
      const mockComponent = () => <div>Webpack Component</div>;
      (CodeSplitter.dynamicImport as jest.Mock).mockResolvedValue({
        default: mockComponent
      });

      await CodeSplitter.loadWithWebpack({
        chunkName: 'webpack-chunk',
        component: 'WebpackComponent'
      });

      expect(CodeSplitter.dynamicImport).toHaveBeenCalled();
    });

    it('should handle webpack chunk names', () => {
      const chunkName = CodeSplitter.getChunkName('src/components/TestComponent');

      expect(chunkName).toBe('test-component');
    });
  });

  describe('Typescript Support', () => {
    it('should preserve types for dynamic imports', async () => {
      interface TestComponentProps {
        title: string;
      }

      const mockComponent = (props: TestComponentProps) => (
        <div>{props.title}</div>
      );

      (CodeSplitter.dynamicImport as jest.Mock).mockResolvedValue({
        default: mockComponent
      });

      const result = await CodeSplitter.loadComponent<TestComponentProps>(
        'TypedComponent'
      );

      expect(result).toBeDefined();
    });
  });

  describe('SSR Compatibility', () => {
    it('should handle server-side rendering', async () => {
      const isServer = typeof window === 'undefined';

      const mockComponent = () => <div>SSR Component</div>;
      (CodeSplitter.dynamicImport as jest.Mock).mockResolvedValue({
        default: mockComponent
      });

      const result = await CodeSplitter.loadComponent('SSRComponent');

      expect(result).toBeDefined();
    });

    it('should provide loading fallback for SSR', () => {
      const Fallback = () => <div>Loading...</div>;
      const WrappedComponent = CodeSplitter.withSSRFallback(
        () => Promise.resolve({ default: () => <div>Content</div> }),
        Fallback
      );

      expect(WrappedComponent).toBeDefined();
    });
  });

  describe('Memory Management', () => {
    it('should unload unused components', () => {
      CodeSplitter.loadComponent('UnloadComponent');
      CodeSplitter.unloadComponent('UnloadComponent');

      // Component should be removed from cache
      expect(CodeSplitter.isLoaded('UnloadComponent')).toBe(false);
    });

    it('should limit cache size', async () => {
      const mockComponent = () => <div>Cache Component</div>;
      (CodeSplitter.dynamicImport as jest.Mock).mockResolvedValue({
        default: mockComponent
      });

      // Load many components
      for (let i = 0; i < 20; i++) {
        await CodeSplitter.loadComponent(`Component${i}`);
      }

      // Cache should be limited
      const cacheSize = CodeSplitter.getCacheSize();
      expect(cacheSize).toBeLessThanOrEqual(10);
    });
  });
});
