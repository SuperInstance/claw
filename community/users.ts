/**
 * Spreadsheet Moment - User Profiles Implementation
 *
 * Complete user profile system with reputation, badges, and statistics
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { UserProfile, Badge } from './CommunityFeatures';

/**
 * User activity event
 */
export interface UserActivity {
  id: string;
  userId: string;
  type: 'post' | 'reply' | 'template' | 'review' | 'download';
  targetId: string;
  targetTitle: string;
  createdAt: Date;
}

/**
 * User settings
 */
export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  mentionNotifications: boolean;
  replyNotifications: boolean;
  badgeNotifications: boolean;
  privacyShowProfile: boolean;
  privacyShowEmail: boolean;
  privacyShowStats: boolean;
}

/**
 * User manager class
 */
export class UserManager {
  private db: UserDatabase;

  constructor(database: UserDatabase) {
    this.db = database;
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return await this.db.getUserProfile(userId);
  }

  /**
   * Create user profile
   */
  async createUserProfile(data: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  }): Promise<UserProfile> {
    const profile: UserProfile = {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      bio: '',
      location: '',
      website: '',
      twitter: '',
      github: '',
      linkedin: '',
      joinedAt: new Date(),
      reputation: 0,
      badges: [],
      statistics: {
        posts: 0,
        replies: 0,
        templates: 0,
        downloads: 0,
        upvotesReceived: 0,
      },
    };

    await this.db.createUserProfile(profile);

    return profile;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: {
    name?: string;
    bio?: string;
    location?: string;
    avatar?: string;
    website?: string;
    twitter?: string;
    github?: string;
    linkedin?: string;
  }): Promise<UserProfile | null> {
    return await this.db.updateProfile(userId, updates);
  }

  /**
   * Update user settings
   */
  async updateSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings | null> {
    return await this.db.updateSettings(userId, settings);
  }

  /**
   * Get user settings
   */
  async getSettings(userId: string): Promise<UserSettings | null> {
    return await this.db.getSettings(userId);
  }

  /**
   * Get user activity feed
   */
  async getActivity(userId: string, options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<UserActivity[]> {
    return await this.db.getUserActivity(userId, options);
  }

  /**
   * Get user posts
   */
  async getUserPosts(userId: string): Promise<any[]> {
    return await this.db.getUserPosts(userId);
  }

  /**
   * Get user replies
   */
  async getUserReplies(userId: string): Promise<any[]> {
    return await this.db.getUserReplies(userId);
  }

  /**
   * Get user templates
   */
  async getUserTemplates(userId: string): Promise<any[]> {
    return await this.db.getUserTemplates(userId);
  }

  /**
   * Add reputation to user
   */
  async addReputation(userId: string, amount: number): Promise<number> {
    const profile = await this.db.getUserProfile(userId);

    if (!profile) {
      return 0;
    }

    const newReputation = Math.max(0, profile.reputation + amount);
    await this.db.setReputation(userId, newReputation);

    return newReputation;
  }

  /**
   * Get user reputation
   */
  async getReputation(userId: string): Promise<number> {
    const profile = await this.db.getUserProfile(userId);
    return profile?.reputation || 0;
  }

  /**
   * Award badge to user
   */
  async awardBadge(userId: string, badge: Omit<Badge, 'earnedAt'>): Promise<void> {
    const profile = await this.db.getUserProfile(userId);

    if (!profile) {
      return;
    }

    // Check if user already has this badge
    const hasBadge = profile.badges.some(b => b.id === badge.id);

    if (!hasBadge) {
      await this.db.addBadge(userId, {
        ...badge,
        earnedAt: new Date(),
      });

      // Notify user
      await this.db.notifyUser(userId, {
        type: 'badge',
        badgeId: badge.id,
        message: `You earned the ${badge.name} badge!`,
      });
    }
  }

  /**
   * Remove badge from user
   */
  async removeBadge(userId: string, badgeId: string): Promise<boolean> {
    return await this.db.removeBadge(userId, badgeId);
  }

  /**
   * Update user statistics
   */
  async updateStatistics(userId: string, updates: {
    posts?: number;
    replies?: number;
    templates?: number;
    downloads?: number;
    upvotesReceived?: number;
  }): Promise<void> {
    const profile = await this.db.getUserProfile(userId);

    if (!profile) {
      return;
    }

    await this.db.updateStatistics(userId, {
      ...profile.statistics,
      ...updates,
    });
  }

  /**
   * Search users
   */
  async searchUsers(query: string, options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<UserProfile[]> {
    return await this.db.searchUsers(query, options);
  }

  /**
   * Get top contributors
   */
  async getTopContributors(options: {
    limit?: number;
    timeFrame?: 'week' | 'month' | 'year' | 'all';
  } = {}): Promise<Array<{ user: UserProfile; score: number }>> {
    return await this.db.getTopContributors(options);
  }

  /**
   * Record user activity
   */
  async recordActivity(activity: Omit<UserActivity, 'id'>): Promise<void> {
    await this.db.recordActivity({
      ...activity,
      id: this.generateId(),
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * User database interface
 */
export interface UserDatabase {
  // Profiles
  createUserProfile(profile: UserProfile): Promise<void>;
  getUserProfile(userId: string): Promise<UserProfile | null>;
  updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null>;

  // Settings
  getSettings(userId: string): Promise<UserSettings | null>;
  updateSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings | null>;

  // Reputation
  setReputation(userId: string, reputation: number): Promise<void>;

  // Badges
  addBadge(userId: string, badge: Badge): Promise<void>;
  removeBadge(userId: string, badgeId: string): Promise<boolean>;

  // Statistics
  updateStatistics(userId: string, statistics: UserProfile['statistics']): Promise<void>;

  // Activity
  getUserActivity(userId: string, options: { limit?: number; offset?: number }): Promise<UserActivity[]>;
  recordActivity(activity: UserActivity): Promise<void>;

  // Content
  getUserPosts(userId: string): Promise<any[]>;
  getUserReplies(userId: string): Promise<any[]>;
  getUserTemplates(userId: string): Promise<any[]>;

  // Search
  searchUsers(query: string, options: { limit?: number; offset?: number }): Promise<UserProfile[]>;
  getTopContributors(options: { limit?: number; timeFrame?: 'week' | 'month' | 'year' | 'all' }): Promise<Array<{ user: UserProfile; score: number }>>;

  // Notifications
  notifyUser(userId: string, notification: any): Promise<void>;
}

/**
 * In-memory user database for testing
 */
export class InMemoryUserDatabase implements UserDatabase {
  private profiles = new Map<string, UserProfile>();
  private settings = new Map<string, UserSettings>();
  private activities = new Map<string, UserActivity[]>();
  private activityCounter = 0;

  async createUserProfile(profile: UserProfile): Promise<void> {
    this.profiles.set(profile.id, profile);
    this.activities.set(profile.id, []);
    this.settings.set(profile.id, {
      emailNotifications: true,
      pushNotifications: true,
      weeklyDigest: true,
      mentionNotifications: true,
      replyNotifications: true,
      badgeNotifications: true,
      privacyShowProfile: true,
      privacyShowEmail: false,
      privacyShowStats: true,
    });
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.profiles.get(userId) || null;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const profile = this.profiles.get(userId);
    if (!profile) return null;

    const updated = { ...profile, ...updates };
    this.profiles.set(userId, updated);
    return updated;
  }

  async getSettings(userId: string): Promise<UserSettings | null> {
    return this.settings.get(userId) || null;
  }

  async updateSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings | null> {
    const current = this.settings.get(userId);
    if (!current) return null;

    const updated = { ...current, ...settings };
    this.settings.set(userId, updated);
    return updated;
  }

  async setReputation(userId: string, reputation: number): Promise<void> {
    const profile = this.profiles.get(userId);
    if (profile) {
      profile.reputation = reputation;
    }
  }

  async addBadge(userId: string, badge: Badge): Promise<void> {
    const profile = this.profiles.get(userId);
    if (profile) {
      profile.badges.push(badge);
    }
  }

  async removeBadge(userId: string, badgeId: string): Promise<boolean> {
    const profile = this.profiles.get(userId);
    if (!profile) return false;

    const index = profile.badges.findIndex(b => b.id === badgeId);
    if (index === -1) return false;

    profile.badges.splice(index, 1);
    return true;
  }

  async updateStatistics(userId: string, statistics: UserProfile['statistics']): Promise<void> {
    const profile = this.profiles.get(userId);
    if (profile) {
      profile.statistics = statistics;
    }
  }

  async getUserActivity(userId: string, options: { limit?: number; offset?: number }): Promise<UserActivity[]> {
    const activities = this.activities.get(userId) || [];
    const offset = options.offset || 0;
    const limit = options.limit || 20;
    return activities.slice(offset, offset + limit);
  }

  async recordActivity(activity: UserActivity): Promise<void> {
    const activities = this.activities.get(activity.userId) || [];
    activities.unshift(activity);

    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.pop();
    }

    this.activities.set(activity.userId, activities);
  }

  async getUserPosts(userId: string): Promise<any[]> {
    // Placeholder - would integrate with forum database
    return [];
  }

  async getUserReplies(userId: string): Promise<any[]> {
    // Placeholder - would integrate with forum database
    return [];
  }

  async getUserTemplates(userId: string): Promise<any[]> {
    // Placeholder - would integrate with template database
    return [];
  }

  async searchUsers(query: string, options: { limit?: number; offset?: number }): Promise<UserProfile[]> {
    const lowerQuery = query.toLowerCase();
    let results = Array.from(this.profiles.values()).filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.bio.toLowerCase().includes(lowerQuery)
    );

    const offset = options.offset || 0;
    const limit = options.limit || 20;
    return results.slice(offset, offset + limit);
  }

  async getTopContributors(options: { limit?: number; timeFrame?: 'week' | 'month' | 'year' | 'all' }): Promise<Array<{ user: UserProfile; score: number }>> {
    const limit = options.limit || 10;

    return Array.from(this.profiles.values())
      .map(user => ({
        user,
        score: this.calculateContributionScore(user),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private calculateContributionScore(user: UserProfile): number {
    return (
      user.statistics.posts * 10 +
      user.statistics.replies * 5 +
      user.statistics.templates * 20 +
      user.statistics.downloads * 2 +
      user.reputation
    );
  }

  async notifyUser(userId: string, notification: any): Promise<void> {
    console.log(`Notification for ${userId}:`, notification);
  }
}
