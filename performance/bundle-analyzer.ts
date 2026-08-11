/**
 * Spreadsheet Moment - Bundle Analyzer
 *
 * Round 16: Bundle analysis and optimization tools
 * Features: Module analysis, dependency mapping, size optimization
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

/**
 * Bundle module information
 */
export interface BundleModule {
  /** Module identifier */
  id: string;
  /** Module name */
  name: string;
  /** Size in bytes */
  size: number;
  /** Percentage of total bundle */
  percentage: number;
  /** Number of dependencies */
  dependencies: number;
  /** List of dependency IDs */
  dependencyIds: string[];
  /** Is this a dynamic import */
  isDynamic: boolean;
  /** Is this chunk code-split */
  isCodeSplit: boolean;
}

/**
 * Bundle analysis result
 */
export interface BundleAnalysis {
  /** Total bundle size in bytes */
  totalSize: number;
  /** Total size in KB */
  totalSizeKB: number;
  /** Total size in MB */
  totalSizeMB: number;
  /** Number of modules */
  moduleCount: number;
  /** Number of chunks */
  chunkCount: number;
  /** Module details */
  modules: BundleModule[];
  /** Largest modules */
  largestModules: BundleModule[];
  /** Code split modules */
  codeSplitModules: BundleModule[];
  /** Duplicate dependencies */
  duplicateDependencies: Map<string, number>;
  /** Tree shakeable modules */
  treeShakeable: BundleModule[];
  /** Optimization suggestions */
  suggestions: OptimizationSuggestion[];
}

/**
 * Optimization suggestion
 */
export interface OptimizationSuggestion {
  /** Suggestion type */
  type: 'code-split' | 'tree-shake' | 'dynamic-import' | 'compression' | 'lazy-load';
  /** Priority level */
  priority: 'high' | 'medium' | 'low';
  /** Suggestion title */
  title: string;
  /** Detailed description */
  description: string;
  /** Estimated savings */
  estimatedSavings: number;
  /** Affected modules */
  modules: string[];
}

/**
 * Bundle size comparison
 */
export interface SizeComparison {
  /** Original size */
  original: number;
  /** Optimized size */
  optimized: number;
  /** Absolute savings */
  savings: number;
  /** Percentage savings */
  savingsPercent: number;
}

/**
 * Bundle Analyzer class
 */
export class BundleAnalyzer {
  private performanceData: Map<string, any> = new Map();
  private moduleMap: Map<string, BundleModule> = new Map();

  /**
   * Analyze bundle from performance API
   */
  async analyzeBundle(): Promise<BundleAnalysis> {
    if (typeof performance === 'undefined' || !performance.getEntriesByType) {
      return this.getEmptyAnalysis();
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter((r) => r.name.endsWith('.js'));

    const modules: BundleModule[] = jsResources.map((resource, index) => {
      const size = resource.transferSize || 0;
      const module: BundleModule = {
        id: `module-${index}`,
        name: this.getModuleName(resource.name),
        size,
        percentage: 0, // Will be calculated
        dependencies: 0,
        dependencyIds: [],
        isDynamic: this.isDynamicChunk(resource.name),
        isCodeSplit: this.isCodeSplitChunk(resource.name),
      };

      this.moduleMap.set(module.id, module);
      return module;
    });

    const totalSize = modules.reduce((sum, m) => sum + m.size, 0);
    modules.forEach((m) => (m.percentage = (m.size / totalSize) * 100));

    return {
      totalSize,
      totalSizeKB: totalSize / 1024,
      totalSizeMB: totalSize / 1024 / 1024,
      moduleCount: modules.length,
      chunkCount: jsResources.length,
      modules,
      largestModules: this.getLargestModules(modules, 10),
      codeSplitModules: modules.filter((m) => m.isCodeSplit),
      duplicateDependencies: this.findDuplicateDependencies(modules),
      treeShakeable: this.findTreeShakeableModules(modules),
      suggestions: this.generateSuggestions(modules, totalSize),
    };
  }

  /**
   * Analyze specific chunk
   */
  async analyzeChunk(chunkName: string): Promise<BundleModule | null> {
    await this.populatePerformanceData();

    for (const [, module] of this.moduleMap) {
      if (module.name === chunkName || module.name.includes(chunkName)) {
        return module;
      }
    }

    return null;
  }

  /**
   * Get duplicate dependencies
   */
  findDuplicateDependencies(modules: BundleModule[]): Map<string, number> {
    const dependencyCounts = new Map<string, number>();

    // In a real implementation, this would parse the bundle
    // For now, we'll simulate based on module names
    modules.forEach((module) => {
      const deps = this.extractDependencies(module);
      deps.forEach((dep) => {
        const count = dependencyCounts.get(dep) || 0;
        dependencyCounts.set(dep, count + 1);
      });
    });

    // Filter to only duplicates
    const duplicates = new Map<string, number>();
    dependencyCounts.forEach((count, dep) => {
      if (count > 1) {
        duplicates.set(dep, count);
      }
    });

    return duplicates;
  }

  /**
   * Find tree-shakeable modules
   */
  findTreeShakeableModules(modules: BundleModule[]): BundleModule[] {
    // In a real implementation, this would analyze module exports
    // For now, we'll flag modules that appear to be libraries
    return modules.filter((module) => {
      const name = module.name.toLowerCase();
      return (
        name.includes('lodash') ||
        name.includes('moment') ||
        name.includes('axios') ||
        name.includes('utils')
      );
    });
  }

  /**
   * Generate optimization suggestions
   */
  generateSuggestions(modules: BundleModule[], totalSize: number): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Check for code-splitting opportunities
    const largeModules = modules.filter((m) => m.size > 100 * 1024 && !m.isCodeSplit);
    if (largeModules.length > 0) {
      suggestions.push({
        type: 'code-split',
        priority: 'high',
        title: 'Code split large modules',
        description: `${largeModules.length} modules are over 100KB and should be code-split for better loading performance.`,
        estimatedSavings: largeModules.reduce((sum, m) => sum + m.size * 0.3, 0),
        modules: largeModules.map((m) => m.name),
      });
    }

    // Check for tree-shaking opportunities
    const treeShakeable = this.findTreeShakeableModules(modules);
    if (treeShakeable.length > 0) {
      suggestions.push({
        type: 'tree-shake',
        priority: 'medium',
        title: 'Enable tree shaking for library modules',
        description: `${treeShakeable.length} modules appear to be libraries that could benefit from tree shaking.`,
        estimatedSavings: treeShakeable.reduce((sum, m) => sum + m.size * 0.4, 0),
        modules: treeShakeable.map((m) => m.name),
      });
    }

    // Check for dynamic import opportunities
    const dynamicCandidates = modules.filter((m) => !m.isDynamic && m.size > 50 * 1024);
    if (dynamicCandidates.length > 0) {
      suggestions.push({
        type: 'dynamic-import',
        priority: 'medium',
        title: 'Use dynamic imports for large modules',
        description: `${dynamicCandidates.length} modules could be loaded dynamically to reduce initial bundle size.`,
        estimatedSavings: dynamicCandidates.reduce((sum, m) => sum + m.size * 0.5, 0),
        modules: dynamicCandidates.map((m) => m.name),
      });
    }

    // Check for compression
    const compressibleSize = modules.reduce((sum, m) => sum + m.size, 0);
    suggestions.push({
      type: 'compression',
      priority: 'high',
      title: 'Enable compression',
      description: 'Enable gzip or brotli compression for all JavaScript assets.',
      estimatedSavings: compressibleSize * 0.7,
      modules: modules.map((m) => m.name),
    });

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Compare sizes
   */
  compareSizes(original: number, optimized: number): SizeComparison {
    const savings = original - optimized;
    const savingsPercent = original > 0 ? (savings / original) * 100 : 0;

    return {
      original,
      optimized,
      savings,
      savingsPercent,
    };
  }

  /**
   * Calculate potential savings
   */
  calculatePotentialSavings(analysis: BundleAnalysis): {
    codeSplitting: number;
    treeShaking: number;
    compression: number;
    total: number;
  } {
    const codeSplitting = analysis.suggestions
      .filter((s) => s.type === 'code-split')
      .reduce((sum, s) => sum + s.estimatedSavings, 0);

    const treeShaking = analysis.suggestions
      .filter((s) => s.type === 'tree-shake')
      .reduce((sum, s) => sum + s.estimatedSavings, 0);

    const compression = analysis.suggestions
      .filter((s) => s.type === 'compression')
      .reduce((sum, s) => sum + s.estimatedSavings, 0);

    return {
      codeSplitting,
      treeShaking,
      compression,
      total: codeSplitting + treeShaking + compression,
    };
  }

  /**
   * Get largest modules
   */
  private getLargestModules(modules: BundleModule[], count: number): BundleModule[] {
    return [...modules].sort((a, b) => b.size - a.size).slice(0, count);
  }

  /**
   * Get module name from URL
   */
  private getModuleName(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  }

  /**
   * Check if chunk is dynamically imported
   */
  private isDynamicChunk(url: string): boolean {
    return url.includes('.chunk.') || url.includes('.lazy.');
  }

  /**
   * Check if chunk is code-split
   */
  private isCodeSplitChunk(url: string): boolean {
    return url.includes('~') || url.includes('node_modules');
  }

  /**
   * Extract dependencies from module
   */
  private extractDependencies(module: BundleModule): string[] {
    // In a real implementation, this would parse the module
    // For now, return empty array
    return [];
  }

  /**
   * Populate performance data
   */
  private async populatePerformanceData(): Promise<void> {
    if (typeof performance === 'undefined' || !performance.getEntriesByType) {
      return;
    }

    const resources = performance.getEntriesByType('resource');
    resources.forEach((entry) => {
      this.performanceData.set(entry.name, entry);
    });
  }

  /**
   * Get empty analysis
   */
  private getEmptyAnalysis(): BundleAnalysis {
    return {
      totalSize: 0,
      totalSizeKB: 0,
      totalSizeMB: 0,
      moduleCount: 0,
      chunkCount: 0,
      modules: [],
      largestModules: [],
      codeSplitModules: [],
      duplicateDependencies: new Map(),
      treeShakeable: [],
      suggestions: [],
    };
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    this.performanceData.clear();
    this.moduleMap.clear();
  }
}

/**
 * Create singleton instance
 */
export const bundleAnalyzer = new BundleAnalyzer();

/**
 * Quick analysis function
 */
export async function analyzeBundle(): Promise<BundleAnalysis> {
  return bundleAnalyzer.analyzeBundle();
}

/**
 * Get optimization suggestions
 */
export async function getOptimizationSuggestions(): Promise<OptimizationSuggestion[]> {
  const analysis = await bundleAnalyzer.analyzeBundle();
  return analysis.suggestions;
}
