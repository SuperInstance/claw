/**
 * Spreadsheet Moment - Gamification System Implementation
 *
 * Complete badges, achievements, and reputation system
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { UserProfile, Badge, GamificationSystem } from './CommunityFeatures';

/**
 * Achievement types
 */
export type AchievementType =
  | 'first_post'
  | 'first_reply'
  | 'first_template'
  | 'prolific_poster'
  | 'prolific_replier'
  | 'helpful_answer'
  | 'great_question'
  | 'template_creator'
  | 'top_contributor'
  | 'community_leader'
  | 'bug_hunter'
  | 'feature_suggester'
  | 'reviewer'
  | 'mentor'
  | 'early_adopter';

/**
 * Achievement definition
 */
export interface Achievement {
  id: AchievementType;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: {
    type: 'count' | 'reputation' | 'special';
    value?: number;
    condition?: (user: UserProfile) => boolean;
  };
  reward: {
    reputation: number;
  };
}

/**
 * All available achievements
 */
export const ACHIEVEMENTS: Achievement[] = [
  // Posting achievements
  {
    id: 'first_post',
    name: 'First Steps',
    description: 'Created your first post',
    icon: '📝',
    rarity: 'common',
    requirement: { type: 'count', value: 1 },
    reward: { reputation: 10 },
  },
  {
    id: 'prolific_poster',
    name: 'Prolific Poster',
    description: 'Created 100 posts',
    icon: '✍️',
    rarity: 'epic',
    requirement: { type: 'count', value: 100 },
    reward: { reputation: 100 },
  },
  {
    id: 'great_question',
    name: 'Great Question',
    description: 'Your post received 50 upvotes',
    icon: '👍',
    rarity: 'rare',
    requirement: {
      type: 'special',
      condition: (user) => user.statistics.upvotesReceived >= 50,
    },
    reward: { reputation: 50 },
  },

  // Reply achievements
  {
    id: 'first_reply',
    name: 'Helper',
    description: 'Posted your first reply',
    icon: '💬',
    rarity: 'common',
    requirement: { type: 'count', value: 1 },
    reward: { reputation: 5 },
  },
  {
    id: 'prolific_replier',
    name: 'Discussion Master',
    description: 'Posted 500 replies',
    icon: '🗨️',
    rarity: 'epic',
    requirement: { type: 'count', value: 500 },
    reward: { reputation: 75 },
  },
  {
    id: 'helpful_answer',
    name: 'Problem Solver',
    description: 'Your answer was accepted 50 times',
    icon: '✅',
    rarity: 'rare',
    requirement: {
      type: 'special',
      condition: (user) => user.statistics.replies >= 50,
    },
    reward: { reputation: 50 },
  },

  // Template achievements
  {
    id: 'first_template',
    name: 'Creator',
    description: 'Published your first template',
    icon: '📊',
    rarity: 'common',
    requirement: { type: 'count', value: 1 },
    reward: { reputation: 15 },
  },
  {
    id: 'template_creator',
    name: 'Template Master',
    description: 'Published 10 templates',
    icon: '📋',
    rarity: 'rare',
    requirement: { type: 'count', value: 10 },
    reward: { reputation: 50 },
  },

  // Reputation achievements
  {
    id: 'top_contributor',
    name: 'Top Contributor',
    description: 'Reached 100 reputation',
    icon: '⭐',
    rarity: 'rare',
    requirement: { type: 'reputation', value: 100 },
    reward: { reputation: 25 },
  },
  {
    id: 'community_leader',
    name: 'Community Leader',
    description: 'Reached 1,000 reputation',
    icon: '👑',
    rarity: 'legendary',
    requirement: { type: 'reputation', value: 1000 },
    reward: { reputation: 100 },
  },

  // Special achievements
  {
    id: 'bug_hunter',
    name: 'Bug Hunter',
    description: 'Reported 10 confirmed bugs',
    icon: '🐛',
    rarity: 'rare',
    requirement: { type: 'count', value: 10 },
    reward: { reputation: 50 },
  },
  {
    id: 'feature_suggester',
    name: 'Visionary',
    description: 'Suggested a feature that was implemented',
    icon: '💡',
    rarity: 'epic',
    requirement: { type: 'special', condition: () => false }, // Manually awarded
    reward: { reputation: 75 },
  },
  {
    id: 'reviewer',
    name: 'Critic',
    description: 'Wrote 25 template reviews',
    icon: '⭐',
    rarity: 'rare',
    requirement: { type: 'count', value: 25 },
    reward: { reputation: 40 },
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Helped 100 users through answers',
    icon: '🤝',
    rarity: 'legendary',
    requirement: {
      type: 'special',
      condition: (user) => user.statistics.replies >= 100,
    },
    reward: { reputation: 100 },
  },
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined in the first month',
    icon: '🚀',
    rarity: 'rare',
    requirement: {
      type: 'special',
      condition: (user) => {
        const joinDate = new Date(user.joinedAt);
        const now = new Date();
        const daysSinceJoin = (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceJoin > 30;
      },
    },
    reward: { reputation: 30 },
  },
];

/**
 * Gamification manager class
 */
export class GamificationManager {
  private db: GamificationDatabase;

  constructor(database: GamificationDatabase) {
    this.db = database;
  }

  /**
   * Check and award achievements
   */
  async checkAchievements(userId: string): Promise<Badge[]> {
    const user = await this.db.getUserProfile(userId);

    if (!user) {
      return [];
    }

    const newBadges: Badge[] = [];

    for (const achievement of ACHIEVEMENTS) {
      // Skip if user already has this badge
      if (user.badges.some(b => b.id === achievement.id)) {
        continue;
      }

      // Check if requirements are met
      if (this.checkRequirement(user, achievement)) {
        const badge: Badge = {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          rarity: achievement.rarity,
          earnedAt: new Date(),
        };

        await this.awardBadge(userId, badge);
        newBadges.push(badge);

        // Award reputation reward
        await this.db.addReputation(userId, achievement.reward.reputation);
      }
    }

    return newBadges;
  }

  /**
   * Award a badge to user
   */
  async awardBadge(userId: string, badge: Badge): Promise<void> {
    await this.db.addBadge(userId, badge);

    // Notify user
    await this.db.notifyUser(userId, {
      type: 'badge',
      badgeId: badge.id,
      message: `You earned the ${badge.name} badge!`,
    });
  }

  /**
   * Check if user meets achievement requirements
   */
  private checkRequirement(user: UserProfile, achievement: Achievement): boolean {
    switch (achievement.requirement.type) {
      case 'count':
        // For count-based achievements, check various statistics
        if (achievement.id.includes('post') && achievement.id !== 'first_post') {
          return user.statistics.posts >= (achievement.requirement.value || 0);
        }
        if (achievement.id.includes('reply')) {
          return user.statistics.replies >= (achievement.requirement.value || 0);
        }
        if (achievement.id.includes('template')) {
          return user.statistics.templates >= (achievement.requirement.value || 0);
        }
        return false;

      case 'reputation':
        return user.reputation >= (achievement.requirement.value || 0);

      case 'special':
        return achievement.requirement.condition?.(user) || false;

      default:
        return false;
    }
  }

  /**
   * Get user level
   */
  getUserLevel(reputation: number): { level: number; title: string; nextLevel: number; progress: number } {
    const levels = [
      { threshold: 0, title: 'Newcomer' },
      { threshold: 50, title: 'Member' },
      { threshold: 200, title: 'Active Member' },
      { threshold: 500, title: 'Trusted Member' },
      { threshold: 1000, title: 'Expert' },
      { threshold: 2500, title: 'Master' },
      { threshold: 5000, title: 'Grandmaster' },
    ];

    let currentLevel = levels[0];
    let nextLevel = levels[1];
    let levelIndex = 0;

    for (let i = 0; i < levels.length; i++) {
      if (reputation >= levels[i].threshold) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1] || levels[i];
        levelIndex = i;
      }
    }

    const progress = nextLevel
      ? ((reputation - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100
      : 100;

    return {
      level: levelIndex + 1,
      title: currentLevel.title,
      nextLevel: nextLevel.threshold,
      progress: Math.min(100, Math.max(0, progress)),
    };
  }

  /**
   * Get user badges grouped by rarity
   */
  async getBadgesByRarity(userId: string): Promise<{
    common: Badge[];
    rare: Badge[];
    epic: Badge[];
    legendary: Badge[];
  }> {
    const user = await this.db.getUserProfile(userId);

    if (!user) {
      return { common: [], rare: [], epic: [], legendary: [] };
    }

    return {
      common: user.badges.filter(b => b.rarity === 'common'),
      rare: user.badges.filter(b => b.rarity === 'rare'),
      epic: user.badges.filter(b => b.rarity === 'epic'),
      legendary: user.badges.filter(b => b.rarity === 'legendary'),
    };
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(options: {
    limit?: number;
    offset?: number;
    sortBy?: 'reputation' | 'posts' | 'templates';
  } = {}): Promise<Array<{ user: UserProfile; rank: number }>> {
    return await this.db.getLeaderboard(options);
  }

  /**
   * Get user rank
   */
  async getUserRank(userId: string): Promise<number | null> {
    const leaderboard = await this.getLeaderboard({ sortBy: 'reputation' });
    const entry = leaderboard.find(e => e.user.id === userId);
    return entry?.rank || null;
  }

  /**
   * Get available achievements user hasn't earned
   */
  async getAvailableAchievements(userId: string): Promise<Achievement[]> {
    const user = await this.db.getUserProfile(userId);

    if (!user) {
      return ACHIEVEMENTS;
    }

    const earnedIds = new Set(user.badges.map(b => b.id));

    return ACHIEVEMENTS.filter(a => !earnedIds.has(a.id));
  }

  /**
   * Get achievement progress
   */
  async getAchievementProgress(userId: string): Promise<Array<{
    achievement: Achievement;
    progress: number;
    completed: boolean;
  }>> {
    const user = await this.db.getUserProfile(userId);

    if (!user) {
      return [];
    }

    const earnedIds = new Set(user.badges.map(b => b.id));

    return ACHIEVEMENTS.map(achievement => {
      const completed = earnedIds.has(achievement.id);
      let progress = 0;

      if (!completed) {
        switch (achievement.requirement.type) {
          case 'count':
            const value = achievement.requirement.value || 1;
            if (achievement.id.includes('post')) {
              progress = Math.min(100, (user.statistics.posts / value) * 100);
            } else if (achievement.id.includes('reply')) {
              progress = Math.min(100, (user.statistics.replies / value) * 100);
            } else if (achievement.id.includes('template')) {
              progress = Math.min(100, (user.statistics.templates / value) * 100);
            }
            break;

          case 'reputation':
            const repThreshold = achievement.requirement.value || 1;
            progress = Math.min(100, (user.reputation / repThreshold) * 100);
            break;

          case 'special':
            progress = achievement.requirement.condition?.(user) ? 100 : 0;
            break;
        }
      }

      return {
        achievement,
        progress,
        completed,
      };
    });
  }

  /**
   * Get statistics overview
   */
  async getStatisticsOverview(): Promise<{
    totalUsers: number;
    totalPosts: number;
    totalTemplates: number;
    totalBadgesAwarded: number;
    averageReputation: number;
  }> {
    return await this.db.getStatisticsOverview();
  }
}

/**
 * Gamification database interface
 */
export interface GamificationDatabase {
  getUserProfile(userId: string): Promise<UserProfile | null>;
  addBadge(userId: string, badge: Badge): Promise<void>;
  addReputation(userId: string, amount: number): Promise<void>;
  notifyUser(userId: string, notification: any): Promise<void>;
  getLeaderboard(options: { limit?: number; offset?: number; sortBy?: string }): Promise<Array<{ user: UserProfile; rank: number }>>;
  getStatisticsOverview(): Promise<{
    totalUsers: number;
    totalPosts: number;
    totalTemplates: number;
    totalBadgesAwarded: number;
    averageReputation: number;
  }>;
}

/**
 * In-memory gamification database for testing
 */
export class InMemoryGamificationDatabase implements GamificationDatabase {
  private profiles = new Map<string, UserProfile>();

  constructor(initialUsers?: UserProfile[]) {
    if (initialUsers) {
      for (const user of initialUsers) {
        this.profiles.set(user.id, user);
      }
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.profiles.get(userId) || null;
  }

  async addBadge(userId: string, badge: Badge): Promise<void> {
    const user = this.profiles.get(userId);
    if (user) {
      user.badges.push(badge);
    }
  }

  async addReputation(userId: string, amount: number): Promise<void> {
    const user = this.profiles.get(userId);
    if (user) {
      user.reputation = Math.max(0, user.reputation + amount);
    }
  }

  async notifyUser(userId: string, notification: any): Promise<void> {
    console.log(`Notification for ${userId}:`, notification);
  }

  async getLeaderboard(options: { limit?: number; offset?: number; sortBy?: string }): Promise<Array<{ user: UserProfile; rank: number }>> {
    const limit = options.limit || 10;
    const offset = options.offset || 0;

    let users = Array.from(this.profiles.values());

    switch (options.sortBy) {
      case 'posts':
        users.sort((a, b) => b.statistics.posts - a.statistics.posts);
        break;
      case 'templates':
        users.sort((a, b) => b.statistics.templates - a.statistics.templates);
        break;
      case 'reputation':
      default:
        users.sort((a, b) => b.reputation - a.reputation);
        break;
    }

    return users
      .slice(offset, offset + limit)
      .map((user, index) => ({ user, rank: offset + index + 1 }));
  }

  async getStatisticsOverview(): Promise<{
    totalUsers: number;
    totalPosts: number;
    totalTemplates: number;
    totalBadgesAwarded: number;
    averageReputation: number;
  }> {
    const users = Array.from(this.profiles.values());

    return {
      totalUsers: users.length,
      totalPosts: users.reduce((sum, u) => sum + u.statistics.posts, 0),
      totalTemplates: users.reduce((sum, u) => sum + u.statistics.templates, 0),
      totalBadgesAwarded: users.reduce((sum, u) => sum + u.badges.length, 0),
      averageReputation: users.length > 0
        ? users.reduce((sum, u) => sum + u.reputation, 0) / users.length
        : 0,
    };
  }
}
