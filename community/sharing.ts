/**
 * Spreadsheet Moment - Sharing System Implementation
 *
 * Complete sharing system for publishing templates and content to community
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { Template } from './CommunityFeatures';
import { TemplateManager, TemplateCategory } from './templates';
import { UserManager } from './users';
import { GamificationManager } from './gamification';

/**
 * Share metadata
 */
export interface ShareMetadata {
  title: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  thumbnail?: string;
}

/**
 * Share options
 */
export interface ShareOptions {
  publishToGallery: boolean;
  allowComments: boolean;
  allowRating: boolean;
  allowForks: boolean;
  license: 'cc0' | 'cc-by' | 'cc-by-sa' | 'cc-by-nc' | 'cc-by-nc-sa' | 'proprietary';
}

/**
 * Share result
 */
export interface ShareResult {
  template: Template;
  url: string;
  sharedAt: Date;
}

/**
 * Fork event
 */
export interface TemplateFork {
  id: string;
  originalTemplateId: string;
  forkedTemplateId: string;
  forkedBy: string;
  forkedByName: string;
  forkedAt: Date;
}

/**
 * Sharing manager class
 */
export class SharingManager {
  private templateManager: TemplateManager;
  private userManager: UserManager;
  private gamificationManager: GamificationManager;
  private db: SharingDatabase;

  constructor(
    templateManager: TemplateManager,
    userManager: UserManager,
    gamificationManager: GamificationManager,
    database: SharingDatabase
  ) {
    this.templateManager = templateManager;
    this.userManager = userManager;
    this.gamificationManager = gamificationManager;
    this.db = database;
  }

  /**
   * Share spreadsheet to community
   */
  async shareToCommunity(
    userId: string,
    spreadsheetId: string,
    metadata: ShareMetadata,
    options: ShareOptions
  ): Promise<ShareResult> {
    // Get user info
    const user = await this.userManager.getUserProfile(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Validate spreadsheet exists and user owns it
    const canShare = await this.db.canUserShareSpreadsheet(userId, spreadsheetId);

    if (!canShare) {
      throw new Error('You do not have permission to share this spreadsheet');
    }

    // Create template
    const template = await this.templateManager.createTemplate({
      name: metadata.title,
      description: metadata.description,
      thumbnail: metadata.thumbnail || this.generateThumbnail(spreadsheetId),
      category: metadata.category,
      spreadsheetId,
      tags: metadata.tags,
      authorId: userId,
      authorName: user.name,
      authorAvatar: user.avatar,
    });

    // Record share event
    await this.db.recordShare({
      id: this.generateId(),
      templateId: template.id,
      userId,
      options,
      sharedAt: new Date(),
    });

    // Update user statistics
    await this.userManager.updateStatistics(userId, {
      templates: user.statistics.templates + 1,
    });

    // Check for achievements
    await this.gamificationManager.checkAchievements(userId);

    // Generate share URL
    const url = this.generateShareUrl(template.id);

    return {
      template,
      url,
      sharedAt: new Date(),
    };
  }

  /**
   * Fork a template
   */
  async forkTemplate(userId: string, templateId: string): Promise<TemplateFork> {
    const user = await this.userManager.getUserProfile(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Get original template
    const originalTemplate = await this.templateManager.getTemplate(templateId);

    if (!originalTemplate) {
      throw new Error('Template not found');
    }

    // Check if forking is allowed
    const share = await this.db.getShare(templateId);

    if (!share?.allowForks) {
      throw new Error('This template does not allow forking');
    }

    // Clone spreadsheet
    const clonedSpreadsheetId = await this.db.cloneSpreadsheet(originalTemplate.spreadsheetId, userId);

    // Create new template as fork
    const forkedTemplate = await this.templateManager.createTemplate({
      name: `${originalTemplate.name} (Fork)`,
      description: `A fork of "${originalTemplate.name}"`,
      thumbnail: originalTemplate.thumbnail,
      category: originalTemplate.category as TemplateCategory,
      spreadsheetId: clonedSpreadsheetId,
      tags: [...originalTemplate.tags, 'fork'],
      authorId: userId,
      authorName: user.name,
      authorAvatar: user.avatar,
    });

    // Record fork event
    const fork: TemplateFork = {
      id: this.generateId(),
      originalTemplateId: templateId,
      forkedTemplateId: forkedTemplate.id,
      forkedBy: userId,
      forkedByName: user.name,
      forkedAt: new Date(),
    };

    await this.db.recordFork(fork);

    // Notify original author
    await this.userManager.recordActivity({
      userId: originalTemplate.author.id,
      type: 'template',
      targetId: forkedTemplate.id,
      targetTitle: user.name,
      createdAt: new Date(),
    });

    return fork;
  }

  /**
   * Get template forks
   */
  async getTemplateForks(templateId: string): Promise<TemplateFork[]> {
    return await this.db.getTemplateForks(templateId);
  }

  /**
   * Get user's shared templates
   */
  async getUserSharedTemplates(userId: string): Promise<Template[]> {
    return await this.templateManager.getUserTemplates(userId);
  }

  /**
   * Get user's forked templates
   */
  async getUserForkedTemplates(userId: string): Promise<TemplateFork[]> {
    return await this.db.getUserForks(userId);
  }

  /**
   * Update share options
   */
  async updateShareOptions(
    userId: string,
    templateId: string,
    options: Partial<ShareOptions>
  ): Promise<boolean> {
    // Verify user owns template
    const template = await this.templateManager.getTemplate(templateId);

    if (!template || template.author.id !== userId) {
      return false;
    }

    return await this.db.updateShareOptions(templateId, options);
  }

  /**
   * Get share options
   */
  async getShareOptions(templateId: string): Promise<ShareOptions | null> {
    return await this.db.getShareOptions(templateId);
  }

  /**
   * Generate embed code
   */
  generateEmbedCode(templateId: string, options: {
    width?: number;
    height?: number;
    theme?: 'light' | 'dark';
  } = {}): string {
    const { width = 600, height = 400, theme = 'light' } = options;

    return `<iframe
  src="${this.getEmbedUrl(templateId)}"
  width="${width}"
  height="${height}"
  frameborder="0"
  data-theme="${theme}"
  allowfullscreen>
</iframe>`;
  }

  /**
   * Generate share URLs for social media
   */
  generateSocialUrls(templateId: string, templateName: string): {
    twitter: string;
    facebook: string;
    linkedin: string;
    email: string;
  } {
    const url = encodeURIComponent(this.generateShareUrl(templateId));
    const title = encodeURIComponent(`Check out "${templateName}" on Spreadsheet Moment`);
    const description = encodeURIComponent('Discover amazing spreadsheet templates');

    return {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      email: `mailto:?subject=${title}&body=${description}%20${url}`,
    };
  }

  /**
   * Get sharing analytics
   */
  async getSharingAnalytics(templateId: string): Promise<{
    views: number;
    shares: number;
    forks: number;
    downloads: number;
    topSources: Array<{ source: string; count: number }>;
  }> {
    return await this.db.getSharingAnalytics(templateId);
  }

  /**
   * Record share event
   */
  async recordShareEvent(templateId: string, source: 'twitter' | 'facebook' | 'linkedin' | 'direct' | 'embed'): Promise<void> {
    await this.db.recordShareEvent({
      templateId,
      source,
      timestamp: new Date(),
    });
  }

  /**
   * Generate share URL
   */
  private generateShareUrl(templateId: string): string {
    return `https://spreadsheetmoment.com/templates/${templateId}`;
  }

  /**
   * Generate embed URL
   */
  private getEmbedUrl(templateId: string): string {
    return `https://spreadsheetmoment.com/embed/templates/${templateId}`;
  }

  /**
   * Generate thumbnail (placeholder)
   */
  private generateThumbnail(spreadsheetId: string): string {
    return `https://spreadsheetmoment.com/thumbnails/${spreadsheetId}.png`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `share-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Sharing database interface
 */
export interface SharingDatabase {
  // Permissions
  canUserShareSpreadsheet(userId: string, spreadsheetId: string): Promise<boolean>;
  cloneSpreadsheet(spreadsheetId: string, userId: string): Promise<string>;

  // Shares
  recordShare(share: {
    id: string;
    templateId: string;
    userId: string;
    options: ShareOptions;
    sharedAt: Date;
  }): Promise<void>;
  getShare(templateId: string): Promise<ShareOptions | null>;
  updateShareOptions(templateId: string, options: Partial<ShareOptions>): Promise<boolean>;
  getShareOptions(templateId: string): Promise<ShareOptions | null>;

  // Forks
  recordFork(fork: TemplateFork): Promise<void>;
  getTemplateForks(templateId: string): Promise<TemplateFork[]>;
  getUserForks(userId: string): Promise<TemplateFork[]>;

  // Analytics
  recordShareEvent(event: { templateId: string; source: string; timestamp: Date }): Promise<void>;
  getSharingAnalytics(templateId: string): Promise<{
    views: number;
    shares: number;
    forks: number;
    downloads: number;
    topSources: Array<{ source: string; count: number }>;
  }>;
}

/**
 * In-memory sharing database for testing
 */
export class InMemorySharingDatabase implements SharingDatabase {
  private shares = new Map<string, { userId: string; options: ShareOptions }>();
  private forks: TemplateFork[] = [];
  private shareEvents: Array<{ templateId: string; source: string; timestamp: Date }> = [];
  private spreadsheetCounter = 0;

  async canUserShareSpreadsheet(userId: string, spreadsheetId: string): Promise<boolean> {
    // In production, check if user owns spreadsheet
    return true;
  }

  async cloneSpreadsheet(spreadsheetId: string, userId: string): Promise<string> {
    return `clone-${++this.spreadsheetCounter}`;
  }

  async recordShare(share: {
    id: string;
    templateId: string;
    userId: string;
    options: ShareOptions;
    sharedAt: Date;
  }): Promise<void> {
    this.shares.set(share.templateId, {
      userId: share.userId,
      options: share.options,
    });
  }

  async getShare(templateId: string): Promise<ShareOptions | null> {
    return this.shares.get(templateId)?.options || null;
  }

  async updateShareOptions(templateId: string, options: Partial<ShareOptions>): Promise<boolean> {
    const share = this.shares.get(templateId);

    if (!share) {
      return false;
    }

    share.options = { ...share.options, ...options };
    return true;
  }

  async getShareOptions(templateId: string): Promise<ShareOptions | null> {
    return this.shares.get(templateId)?.options || null;
  }

  async recordFork(fork: TemplateFork): Promise<void> {
    this.forks.push(fork);
  }

  async getTemplateForks(templateId: string): Promise<TemplateFork[]> {
    return this.forks.filter(f => f.originalTemplateId === templateId);
  }

  async getUserForks(userId: string): Promise<TemplateFork[]> {
    return this.forks.filter(f => f.forkedBy === userId);
  }

  async recordShareEvent(event: { templateId: string; source: string; timestamp: Date }): Promise<void> {
    this.shareEvents.push(event);
  }

  async getSharingAnalytics(templateId: string): Promise<{
    views: number;
    shares: number;
    forks: number;
    downloads: number;
    topSources: Array<{ source: string; count: number }>;
  }> {
    const templateEvents = this.shareEvents.filter(e => e.templateId === templateId);
    const sourceCounts = new Map<string, number>();

    for (const event of templateEvents) {
      sourceCounts.set(event.source, (sourceCounts.get(event.source) || 0) + 1);
    }

    return {
      views: templateEvents.length,
      shares: sourceCounts.get('twitter') || 0 + sourceCounts.get('facebook') || 0 + sourceCounts.get('linkedin') || 0,
      forks: this.forks.filter(f => f.originalTemplateId === templateId).length,
      downloads: 0, // Would come from template database
      topSources: Array.from(sourceCounts.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
    };
  }
}
