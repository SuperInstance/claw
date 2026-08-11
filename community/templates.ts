/**
 * Spreadsheet Moment - Template Gallery Implementation
 *
 * Complete template gallery with ratings, reviews, and downloads
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { Template } from './CommunityFeatures';

/**
 * Template categories
 */
export const TEMPLATE_CATEGORIES = [
  { id: 'business', name: 'Business', icon: '💼', description: 'Business templates' },
  { id: 'finance', name: 'Finance', icon: '💰', description: 'Financial templates' },
  { id: 'project-management', name: 'Project Management', icon: '📋', description: 'Project management' },
  { id: 'marketing', name: 'Marketing', icon: '📈', description: 'Marketing templates' },
  { id: 'education', name: 'Education', icon: '🎓', description: 'Educational templates' },
  { id: 'personal', name: 'Personal', icon: '👤', description: 'Personal templates' },
  { id: 'data-analysis', name: 'Data Analysis', icon: '📊', description: 'Data analysis' },
  { id: 'inventory', name: 'Inventory', icon: '📦', description: 'Inventory management' },
] as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number]['id'];

/**
 * Template review
 */
export interface TemplateReview {
  id: string;
  templateId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Template download event
 */
export interface TemplateDownload {
  id: string;
  templateId: string;
  userId: string;
  downloadedAt: Date;
}

/**
 * Template manager class
 */
export class TemplateManager {
  private db: TemplateDatabase;

  constructor(database: TemplateDatabase) {
    this.db = database;
  }

  /**
   * Create a new template
   */
  async createTemplate(data: {
    name: string;
    description: string;
    thumbnail: string;
    category: TemplateCategory;
    spreadsheetId: string;
    tags: string[];
    authorId: string;
    authorName: string;
    authorAvatar: string;
  }): Promise<Template> {
    const template: Template = {
      id: this.generateId(),
      name: data.name,
      description: data.description,
      thumbnail: data.thumbnail,
      category: data.category,
      author: {
        id: data.authorId,
        name: data.authorName,
        avatar: data.authorAvatar,
      },
      spreadsheetId: data.spreadsheetId,
      downloads: 0,
      rating: 0,
      reviews: 0,
      tags: data.tags,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.createTemplate(template);

    return template;
  }

  /**
   * Get templates with filtering and sorting
   */
  async getTemplates(options: {
    category?: TemplateCategory;
    sortBy?: 'trending' | 'newest' | 'rating' | 'downloads';
    tags?: string[];
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Template[]> {
    let templates = await this.db.getTemplates(options.category);

    // Filter by search
    if (options.search) {
      const query = options.search.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      templates = templates.filter(t =>
        options.tags!.some(tag => t.tags.includes(tag))
      );
    }

    // Filter by featured
    if (options.featured) {
      templates = templates.filter(t => t.featured);
    }

    // Sort templates
    switch (options.sortBy) {
      case 'trending':
        templates.sort((a, b) => {
          const scoreA = this.calculateTrendScore(a);
          const scoreB = this.calculateTrendScore(b);
          return scoreB - scoreA;
        });
        break;
      case 'newest':
        templates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'rating':
        templates.sort((a, b) => b.rating - a.rating);
        break;
      case 'downloads':
        templates.sort((a, b) => b.downloads - a.downloads);
        break;
    }

    // Pagination
    const offset = options.offset || 0;
    const limit = options.limit || 20;
    return templates.slice(offset, offset + limit);
  }

  /**
   * Get a single template
   */
  async getTemplate(templateId: string): Promise<Template | null> {
    return await this.db.getTemplate(templateId);
  }

  /**
   * Update a template
   */
  async updateTemplate(templateId: string, updates: {
    name?: string;
    description?: string;
    thumbnail?: string;
    category?: TemplateCategory;
    tags?: string[];
  }): Promise<Template | null> {
    const template = await this.db.getTemplate(templateId);

    if (!template) {
      return null;
    }

    const updated = await this.db.updateTemplate(templateId, {
      ...updates,
      updatedAt: new Date(),
    });

    return updated;
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<boolean> {
    return await this.db.deleteTemplate(templateId);
  }

  /**
   * Feature/unfeature a template
   */
  async featureTemplate(templateId: string, featured: boolean): Promise<Template | null> {
    return await this.db.updateTemplate(templateId, { featured });
  }

  /**
   * Download a template
   */
  async downloadTemplate(templateId: string, userId: string): Promise<string> {
    const template = await this.db.getTemplate(templateId);

    if (!template) {
      throw new Error('Template not found');
    }

    // Clone template to user's spreadsheets
    const clonedSpreadsheetId = await this.db.cloneSpreadsheet(template.spreadsheetId, userId);

    // Record download
    await this.db.recordDownload({
      id: this.generateId(),
      templateId,
      userId,
      downloadedAt: new Date(),
    });

    // Increment download count
    await this.db.incrementDownloads(templateId);

    // Award reputation to author
    await this.db.addReputation(template.author.id, 2);

    return clonedSpreadsheetId;
  }

  /**
   * Rate a template
   */
  async rateTemplate(templateId: string, data: {
    userId: string;
    userName: string;
    userAvatar: string;
    rating: number;
    title?: string;
    content?: string;
  }): Promise<TemplateReview> {
    // Check if user already reviewed
    const existing = await this.db.getReviewByUser(templateId, data.userId);

    if (existing) {
      // Update existing review
      const review = await this.db.updateReview(existing.id, {
        rating: data.rating,
        title: data.title || existing.title,
        content: data.content || existing.content,
        updatedAt: new Date(),
      });

      await this.recalculateTemplateRating(templateId);

      return review!;
    }

    // Create new review
    const review: TemplateReview = {
      id: this.generateId(),
      templateId,
      userId: data.userId,
      userName: data.userName,
      userAvatar: data.userAvatar,
      rating: data.rating,
      title: data.title || '',
      content: data.content || '',
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.createReview(review);
    await this.recalculateTemplateRating(templateId);

    // Award reputation for reviewing
    await this.db.addReputation(data.userId, 5);

    return review;
  }

  /**
   * Get template reviews
   */
  async getReviews(templateId: string, options: {
    sortBy?: 'recent' | 'helpful' | 'rating';
    limit?: number;
    offset?: number;
  } = {}): Promise<TemplateReview[]> {
    let reviews = await this.db.getReviews(templateId);

    switch (options.sortBy) {
      case 'helpful':
        reviews.sort((a, b) => b.helpful - a.helpful);
        break;
      case 'rating':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'recent':
      default:
        reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    const offset = options.offset || 0;
    const limit = options.limit || 10;
    return reviews.slice(offset, offset + limit);
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(reviewId: string, userId: string): Promise<TemplateReview | null> {
    const review = await this.db.getReview(reviewId);

    if (!review) {
      return null;
    }

    // Check if user already marked
    const marked = await this.db.getReviewHelpfulVote(reviewId, userId);

    if (marked) {
      // Unmark
      await this.db.removeReviewHelpfulVote(reviewId, userId);
      review.helpful--;
    } else {
      await this.db.addReviewHelpfulVote(reviewId, userId);
      review.helpful++;

      // Award reputation to reviewer
      await this.db.addReputation(review.userId, 1);
    }

    return await this.db.getReview(reviewId);
  }

  /**
   * Get user's templates
   */
  async getUserTemplates(userId: string): Promise<Template[]> {
    return await this.db.getTemplatesByAuthor(userId);
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(userId: string): Promise<TemplateReview[]> {
    return await this.db.getReviewsByUser(userId);
  }

  /**
   * Search templates
   */
  async searchTemplates(query: string, filters: {
    category?: TemplateCategory;
    tags?: string[];
    minRating?: number;
  } = {}): Promise<Template[]> {
    return await this.getTemplates({
      ...filters,
      search: query,
    });
  }

  /**
   * Get popular tags
   */
  async getPopularTags(limit: number = 20): Promise<Array<{ tag: string; count: number }>> {
    return await this.db.getPopularTags(limit);
  }

  /**
   * Get trending templates
   */
  async getTrendingTemplates(limit: number = 10): Promise<Template[]> {
    return await this.getTemplates({
      sortBy: 'trending',
      limit,
    });
  }

  /**
   * Get featured templates
   */
  async getFeaturedTemplates(limit: number = 10): Promise<Template[]> {
    return await this.getTemplates({
      featured: true,
      sortBy: 'rating',
      limit,
    });
  }

  /**
   * Calculate trending score
   */
  private calculateTrendScore(template: Template): number {
    const daysSinceCreation = (Date.now() - template.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const decayFactor = Math.max(0.1, 1 - daysSinceCreation / 365); // Decay over a year

    return (
      template.downloads * 0.3 +
      template.rating * template.reviews * 0.4 +
      template.reviews * 0.3
    ) * decayFactor;
  }

  /**
   * Recalculate template rating
   */
  private async recalculateTemplateRating(templateId: string): Promise<void> {
    const reviews = await this.db.getReviews(templateId);

    if (reviews.length === 0) {
      await this.db.updateTemplate(templateId, { rating: 0, reviews: 0 });
      return;
    }

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await this.db.updateTemplate(templateId, {
      rating: Math.round(avgRating * 10) / 10,
      reviews: reviews.length,
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `tmpl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Template database interface
 */
export interface TemplateDatabase {
  // Templates
  createTemplate(template: Template): Promise<void>;
  getTemplate(templateId: string): Promise<Template | null>;
  getTemplates(category?: TemplateCategory): Promise<Template[]>;
  getTemplatesByAuthor(authorId: string): Promise<Template[]>;
  updateTemplate(templateId: string, updates: Partial<Template>): Promise<Template | null>;
  deleteTemplate(templateId: string): Promise<boolean>;
  incrementDownloads(templateId: string): Promise<void>;

  // Reviews
  createReview(review: TemplateReview): Promise<void>;
  getReview(reviewId: string): Promise<TemplateReview | null>;
  getReviews(templateId: string): Promise<TemplateReview[]>;
  getReviewsByUser(userId: string): Promise<TemplateReview[]>;
  getReviewByUser(templateId: string, userId: string): Promise<TemplateReview | null>;
  updateReview(reviewId: string, updates: Partial<TemplateReview>): Promise<TemplateReview | null>;
  deleteReview(reviewId: string): Promise<boolean>;
  addReviewHelpfulVote(reviewId: string, userId: string): Promise<void>;
  removeReviewHelpfulVote(reviewId: string, userId: string): Promise<void>;
  getReviewHelpfulVote(reviewId: string, userId: string): Promise<boolean>;

  // Downloads
  recordDownload(download: TemplateDownload): Promise<void>;

  // Spreadsheet cloning
  cloneSpreadsheet(spreadsheetId: string, userId: string): Promise<string>;

  // Search
  getPopularTags(limit: number): Promise<Array<{ tag: string; count: number }>>;

  // User reputation
  addReputation(userId: string, amount: number): Promise<void>;
}

/**
 * In-memory template database for testing
 */
export class InMemoryTemplateDatabase implements TemplateDatabase {
  private templates = new Map<string, Template>();
  private reviews = new Map<string, TemplateReview[]>();
  private reviewVotes = new Map<string, Set<string>>();
  private userReputation = new Map<string, number>();
  private spreadsheetCounter = 0;

  async createTemplate(template: Template): Promise<void> {
    this.templates.set(template.id, template);
    this.reviews.set(template.id, []);
  }

  async getTemplate(templateId: string): Promise<Template | null> {
    return this.templates.get(templateId) || null;
  }

  async getTemplates(category?: string): Promise<Template[]> {
    let templates = Array.from(this.templates.values());

    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    return templates;
  }

  async getTemplatesByAuthor(authorId: string): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(t => t.author.id === authorId);
  }

  async updateTemplate(templateId: string, updates: Partial<Template>): Promise<Template | null> {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const updated = { ...template, ...updates };
    this.templates.set(templateId, updated);
    return updated;
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    this.templates.delete(templateId);
    this.reviews.delete(templateId);
    return true;
  }

  async incrementDownloads(templateId: string): Promise<void> {
    const template = this.templates.get(templateId);
    if (template) {
      template.downloads++;
    }
  }

  async createReview(review: TemplateReview): Promise<void> {
    const reviews = this.reviews.get(review.templateId) || [];
    reviews.push(review);
    this.reviews.set(review.templateId, reviews);
  }

  async getReview(reviewId: string): Promise<TemplateReview | null> {
    for (const reviews of this.reviews.values()) {
      const review = reviews.find(r => r.id === reviewId);
      if (review) return review;
    }
    return null;
  }

  async getReviews(templateId: string): Promise<TemplateReview[]> {
    return this.reviews.get(templateId) || [];
  }

  async getReviewsByUser(userId: string): Promise<TemplateReview[]> {
    const userReviews: TemplateReview[] = [];
    for (const reviews of this.reviews.values()) {
      userReviews.push(...reviews.filter(r => r.userId === userId));
    }
    return userReviews;
  }

  async getReviewByUser(templateId: string, userId: string): Promise<TemplateReview | null> {
    const reviews = this.reviews.get(templateId) || [];
    return reviews.find(r => r.userId === userId) || null;
  }

  async updateReview(reviewId: string, updates: Partial<TemplateReview>): Promise<TemplateReview | null> {
    for (const [templateId, reviews] of this.reviews.entries()) {
      const index = reviews.findIndex(r => r.id === reviewId);
      if (index !== -1) {
        reviews[index] = { ...reviews[index], ...updates };
        return reviews[index];
      }
    }
    return null;
  }

  async deleteReview(reviewId: string): Promise<boolean> {
    for (const [templateId, reviews] of this.reviews.entries()) {
      const index = reviews.findIndex(r => r.id === reviewId);
      if (index !== -1) {
        reviews.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  async addReviewHelpfulVote(reviewId: string, userId: string): Promise<void> {
    if (!this.reviewVotes.has(reviewId)) {
      this.reviewVotes.set(reviewId, new Set());
    }
    this.reviewVotes.get(reviewId)!.add(userId);
  }

  async removeReviewHelpfulVote(reviewId: string, userId: string): Promise<void> {
    this.reviewVotes.get(reviewId)?.delete(userId);
  }

  async getReviewHelpfulVote(reviewId: string, userId: string): Promise<boolean> {
    return this.reviewVotes.get(reviewId)?.has(userId) || false;
  }

  async recordDownload(download: TemplateDownload): Promise<void> {
    console.log('Recorded download:', download);
  }

  async cloneSpreadsheet(spreadsheetId: string, userId: string): Promise<string> {
    return `clone-${++this.spreadsheetCounter}`;
  }

  async getPopularTags(limit: number): Promise<Array<{ tag: string; count: number }>> {
    const tagCounts = new Map<string, number>();

    for (const template of this.templates.values()) {
      for (const tag of template.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async addReputation(userId: string, amount: number): Promise<void> {
    const current = this.userReputation.get(userId) || 0;
    this.userReputation.set(userId, Math.max(0, current + amount));
  }
}
