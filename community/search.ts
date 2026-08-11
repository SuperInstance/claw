/**
 * Spreadsheet Moment - Community Search Implementation
 *
 * Full-text search with filters for posts and templates
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { ForumPost, Template } from './CommunityFeatures';

/**
 * Search query
 */
export interface SearchQuery {
  q: string;
  type?: 'all' | 'posts' | 'templates' | 'users';
  category?: string;
  tags?: string[];
  sortBy?: 'relevance' | 'recent' | 'popular' | 'rating';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Search result
 */
export interface SearchResult {
  type: 'post' | 'template' | 'user';
  id: string;
  title: string;
  description: string;
  url: string;
  relevanceScore: number;
  metadata: {
    author?: string;
    category?: string;
    tags?: string[];
    createdAt?: Date;
    rating?: number;
    downloads?: number;
  };
}

/**
 * Search suggestion
 */
export interface SearchSuggestion {
  type: 'query' | 'tag' | 'category' | 'user';
  text: string;
  count?: number;
}

/**
 * Search manager class
 */
export class SearchManager {
  private db: SearchDatabase;

  constructor(database: SearchDatabase) {
    this.db = database;
  }

  /**
   * Search across all content
   */
  async search(query: SearchQuery): Promise<{
    results: SearchResult[];
    total: number;
    facets: {
      categories: Array<{ value: string; count: number }>;
      tags: Array<{ value: string; count: number }>;
      types: Array<{ value: string; count: number }>;
    };
  }> {
    const startTime = Date.now();

    // Record search query
    await this.db.recordSearchQuery(query.q);

    // Determine which indexes to search
    const searchTypes = query.type === 'all'
      ? ['posts', 'templates', 'users']
      : [query.type === 'users' ? 'users' : query.type + 's'];

    // Search each type
    const searchPromises = searchTypes.map(type => this.searchByType(type, query));
    const searchResults = await Promise.all(searchPromises);

    // Combine and rank results
    let results = searchResults.flat();

    // Apply filters
    results = this.applyFilters(results, query);

    // Sort results
    results = this.sortResults(results, query.sortBy || 'relevance');

    // Get facets
    const facets = await this.getFacets(query);

    // Record search metrics
    const duration = Date.now() - startTime;
    await this.db.recordSearchMetrics({
      query: query.q,
      resultCount: results.length,
      duration,
      timestamp: new Date(),
    });

    return {
      results: results.slice(0, 20), // Limit to 20 results
      total: results.length,
      facets,
    };
  }

  /**
   * Search by content type
   */
  private async searchByType(
    type: string,
    query: SearchQuery
  ): Promise<SearchResult[]> {
    switch (type) {
      case 'posts':
        return await this.searchPosts(query);
      case 'templates':
        return await this.searchTemplates(query);
      case 'users':
        return await this.searchUsers(query);
      default:
        return [];
    }
  }

  /**
   * Search posts
   */
  private async searchPosts(query: SearchQuery): Promise<SearchResult[]> {
    const posts = await this.db.searchPosts(query.q, {
      category: query.category,
      tags: query.tags,
      dateRange: query.dateRange,
    });

    return posts.map(post => ({
      type: 'post' as const,
      id: post.id,
      title: post.title,
      description: post.content.substring(0, 200) + '...',
      url: `/community/posts/${post.id}`,
      relevanceScore: this.calculateRelevance(post.title, post.content, query.q),
      metadata: {
        author: post.author.name,
        category: post.category,
        tags: post.tags,
        createdAt: post.createdAt,
      },
    }));
  }

  /**
   * Search templates
   */
  private async searchTemplates(query: SearchQuery): Promise<SearchResult[]> {
    const templates = await this.db.searchTemplates(query.q, {
      category: query.category,
      tags: query.tags,
    });

    return templates.map(template => ({
      type: 'template' as const,
      id: template.id,
      title: template.name,
      description: template.description,
      url: `/templates/${template.id}`,
      relevanceScore: this.calculateRelevance(template.name, template.description, query.q),
      metadata: {
        author: template.author.name,
        category: template.category,
        tags: template.tags,
        createdAt: template.createdAt,
        rating: template.rating,
        downloads: template.downloads,
      },
    }));
  }

  /**
   * Search users
   */
  private async searchUsers(query: SearchQuery): Promise<SearchResult[]> {
    const users = await this.db.searchUsers(query.q);

    return users.map(user => ({
      type: 'user' as const,
      id: user.id,
      title: user.name,
      description: user.bio,
      url: `/community/users/${user.id}`,
      relevanceScore: this.calculateRelevance(user.name, user.bio, query.q),
      metadata: {
        author: user.name,
        createdAt: user.joinedAt,
      },
    }));
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(title: string, content: string, query: string): number {
    const queryLower = query.toLowerCase();
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();

    let score = 0;

    // Exact title match
    if (titleLower === queryLower) {
      score += 100;
    }

    // Title contains query
    if (titleLower.includes(queryLower)) {
      score += 50;
    }

    // Word matches in title
    const queryWords = queryLower.split(/\s+/);
    const titleWords = titleLower.split(/\s+/);
    for (const queryWord of queryWords) {
      for (const titleWord of titleWords) {
        if (titleWord === queryWord) {
          score += 10;
        } else if (titleWord.includes(queryWord)) {
          score += 5;
        }
      }
    }

    // Content contains query
    if (contentLower.includes(queryLower)) {
      score += 20;
    }

    // Word matches in content
    const contentWords = contentLower.split(/\s+/);
    for (const queryWord of queryWords) {
      for (const contentWord of contentWords) {
        if (contentWord === queryWord) {
          score += 2;
        }
      }
    }

    return score;
  }

  /**
   * Apply filters to results
   */
  private applyFilters(results: SearchResult[], query: SearchQuery): SearchResult[] {
    let filtered = results;

    // Category filter
    if (query.category) {
      filtered = filtered.filter(r => r.metadata.category === query.category);
    }

    // Tag filter
    if (query.tags && query.tags.length > 0) {
      filtered = filtered.filter(r =>
        query.tags!.some(tag => r.metadata.tags?.includes(tag))
      );
    }

    // Date range filter
    if (query.dateRange) {
      filtered = filtered.filter(r => {
        if (!r.metadata.createdAt) return true;
        return r.metadata.createdAt >= query.dateRange!.start &&
               r.metadata.createdAt <= query.dateRange!.end;
      });
    }

    return filtered;
  }

  /**
   * Sort results
   */
  private sortResults(results: SearchResult[], sortBy: string): SearchResult[] {
    switch (sortBy) {
      case 'recent':
        return results.sort((a, b) => {
          const aDate = a.metadata.createdAt?.getTime() || 0;
          const bDate = b.metadata.createdAt?.getTime() || 0;
          return bDate - aDate;
        });

      case 'popular':
        return results.sort((a, b) => {
          const aScore = (a.metadata.downloads || 0) + (a.metadata.rating || 0) * 10;
          const bScore = (b.metadata.downloads || 0) + (b.metadata.rating || 0) * 10;
          return bScore - aScore;
        });

      case 'rating':
        return results.sort((a, b) => {
          const aRating = a.metadata.rating || 0;
          const bRating = b.metadata.rating || 0;
          return bRating - aRating;
        });

      case 'relevance':
      default:
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  }

  /**
   * Get search facets
   */
  private async getFacets(query: SearchQuery): Promise<{
    categories: Array<{ value: string; count: number }>;
    tags: Array<{ value: string; count: number }>;
    types: Array<{ value: string; count: number }>;
  }> {
    return await this.db.getSearchFacets(query.q);
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];

    // Get popular search queries
    const popularQueries = await this.db.getPopularQueries(5);
    for (const popularQuery of popularQueries) {
      if (popularQuery.toLowerCase().startsWith(query.toLowerCase())) {
        suggestions.push({
          type: 'query',
          text: popularQuery,
          count: await this.db.getQueryCount(popularQuery),
        });
      }
    }

    // Get matching tags
    const tags = await this.db.getMatchingTags(query, 5);
    for (const tag of tags) {
      suggestions.push({
        type: 'tag',
        text: tag.tag,
        count: tag.count,
      });
    }

    // Get matching categories
    const categories = await this.db.getMatchingCategories(query);
    for (const category of categories) {
      suggestions.push({
        type: 'category',
        text: category,
      });
    }

    return suggestions.slice(0, limit);
  }

  /**
   * Get popular searches
   */
  async getPopularSearches(limit: number = 10): Promise<Array<{
    query: string;
    count: number;
  }>> {
    return await this.db.getPopularQueries(limit);
  }

  /**
   * Get trending searches
   */
  async getTrending Searches(limit: number = 10): Promise<Array<{
    query: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>> {
    return await this.db.getTrendingQueries(limit);
  }

  /**
   * Clear search history for user
   */
  async clearSearchHistory(userId: string): Promise<void> {
    await this.db.clearUserSearchHistory(userId);
  }

  /**
   * Get search history for user
   */
  async getSearchHistory(userId: string, limit: number = 10): Promise<string[]> {
    return await this.db.getUserSearchHistory(userId, limit);
  }
}

/**
 * Search database interface
 */
export interface SearchDatabase {
  // Search
  searchPosts(query: string, filters: {
    category?: string;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
  }): Promise<ForumPost[]>;
  searchTemplates(query: string, filters: {
    category?: string;
    tags?: string[];
  }): Promise<Template[]>;
  searchUsers(query: string): Promise<any[]>;

  // Queries
  recordSearchQuery(query: string): Promise<void>;
  recordSearchMetrics(metrics: {
    query: string;
    resultCount: number;
    duration: number;
    timestamp: Date;
  }): Promise<void>;
  getQueryCount(query: string): Promise<number>;
  getPopularQueries(limit: number): Promise<string[]>;
  getTrendingQueries(limit: number): Promise<Array<{ query: string; count: number; trend: 'up' | 'down' | 'stable' }>>;
  getUserSearchHistory(userId: string, limit: number): Promise<string[]>;
  clearUserSearchHistory(userId: string): Promise<void>;

  // Facets
  getSearchFacets(query: string): Promise<{
    categories: Array<{ value: string; count: number }>;
    tags: Array<{ value: string; count: number }>;
    types: Array<{ value: string; count: number }>;
  }>;
  getMatchingTags(query: string, limit: number): Promise<Array<{ tag: string; count: number }>>;
  getMatchingCategories(query: string): Promise<string[]>;
}

/**
 * In-memory search database for testing
 */
export class InMemorySearchDatabase implements SearchDatabase {
  private searchQueries = new Map<string, number>();
  private searchHistory = new Map<string, string[]>();
  private userHistory = new Map<string, string[]>();

  async searchPosts(query: string, filters: {
    category?: string;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
  }): Promise<ForumPost[]> {
    // Placeholder - would integrate with forum database
    return [];
  }

  async searchTemplates(query: string, filters: {
    category?: string;
    tags?: string[];
  }): Promise<Template[]> {
    // Placeholder - would integrate with template database
    return [];
  }

  async searchUsers(query: string): Promise<any[]> {
    // Placeholder - would integrate with user database
    return [];
  }

  async recordSearchQuery(query: string): Promise<void> {
    this.searchQueries.set(query, (this.searchQueries.get(query) || 0) + 1);
  }

  async recordSearchMetrics(metrics: {
    query: string;
    resultCount: number;
    duration: number;
    timestamp: Date;
  }): Promise<void> {
    console.log('Search metrics:', metrics);
  }

  async getQueryCount(query: string): Promise<number> {
    return this.searchQueries.get(query) || 0;
  }

  async getPopularQueries(limit: number): Promise<string[]> {
    return Array.from(this.searchQueries.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query);
  }

  async getTrendingQueries(limit: number): Promise<Array<{ query: string; count: number; trend: 'up' | 'down' | 'stable' }>> {
    // Simplified - would compare time periods in production
    return (await this.getPopularQueries(limit)).map(query => ({
      query,
      count: this.searchQueries.get(query) || 0,
      trend: 'stable' as const,
    }));
  }

  async getUserSearchHistory(userId: string, limit: number): Promise<string[]> {
    return (this.userHistory.get(userId) || []).slice(0, limit);
  }

  async clearUserSearchHistory(userId: string): Promise<void> {
    this.userHistory.delete(userId);
  }

  async getSearchFacets(query: string): Promise<{
    categories: Array<{ value: string; count: number }>;
    tags: Array<{ value: string; count: number }>;
    types: Array<{ value: string; count: number }>;
  }> {
    return {
      categories: [],
      tags: [],
      types: [],
    };
  }

  async getMatchingTags(query: string, limit: number): Promise<Array<{ tag: string; count: number }>> {
    return [];
  }

  async getMatchingCategories(query: string): Promise<string[]> {
    return [];
  }
}
