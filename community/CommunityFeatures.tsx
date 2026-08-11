/**
 * Spreadsheet Moment - Community Engagement Features
 *
 * Round 20: Comprehensive community platform with forums, templates, and sharing
 * Features: Discussion forums, template gallery, user profiles, gamification
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import React, { useState, useCallback } from 'react';

/**
 * Community forum post
 */
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    reputation: number;
  };
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  views: number;
  votes: number;
  replies: ForumReply[];
  acceptedAnswer?: string;
  pinned: boolean;
  locked: boolean;
}

/**
 * Forum reply
 */
export interface ForumReply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    reputation: number;
  };
  createdAt: Date;
  updatedAt: Date;
  votes: number;
  accepted: boolean;
}

/**
 * Template
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  spreadsheetId: string;
  downloads: number;
  rating: number;
  reviews: number;
  tags: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User profile
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  twitter: string;
  github: string;
  linkedin: string;
  joinedAt: Date;
  reputation: number;
  badges: Badge[];
  statistics: {
    posts: number;
    replies: number;
    templates: number;
    downloads: number;
    upvotesReceived: number;
  };
}

/**
 * Badge
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: Date;
}

/**
 * Gamification system
 */
export class GamificationSystem {
  /**
   * Calculate reputation change
   */
  static calculateReputation(action: {
    type: 'post' | 'reply' | 'upvote' | 'downvote' | 'accept' | 'template_download' | 'template_review';
    amount?: number;
  }): number {
    const rewards = {
      post: 10,
      reply: 5,
      upvote: 10,
      downvote: -2,
      accept: 25,
      template_download: 2,
      template_review: 5,
    };

    return rewards[action.type] * (action.amount || 1);
  }

  /**
   * Check if user earned a badge
   */
  static checkBadges(user: UserProfile): Badge[] {
    const badges: Badge[] = [];

    // Posting badges
    if (user.statistics.posts >= 1) {
      badges.push({
        id: 'first_post',
        name: 'First Steps',
        description: 'Created your first post',
        icon: '📝',
        rarity: 'common',
        earnedAt: new Date(),
      });
    }

    if (user.statistics.posts >= 100) {
      badges.push({
        id: 'prolific_poster',
        name: 'Prolific Poster',
        description: 'Created 100 posts',
        icon: '✍️',
        rarity: 'epic',
        earnedAt: new Date(),
      });
    }

    // Reputation badges
    if (user.reputation >= 100) {
      badges.push({
        id: 'respected_member',
        name: 'Respected Member',
        description: 'Reached 100 reputation',
        icon: '⭐',
        rarity: 'rare',
        earnedAt: new Date(),
      });
    }

    if (user.reputation >= 1000) {
      badges.push({
        id: 'community_leader',
        name: 'Community Leader',
        description: 'Reached 1,000 reputation',
        icon: '👑',
        rarity: 'legendary',
        earnedAt: new Date(),
      });
    }

    // Contribution badges
    if (user.statistics.templates >= 10) {
      badges.push({
        id: 'template_creator',
        name: 'Template Creator',
        description: 'Published 10 templates',
        icon: '📊',
        rarity: 'rare',
        earnedAt: new Date(),
      });
    }

    return badges;
  }

  /**
   * Get user level based on reputation
   */
  static getLevel(reputation: number): { level: number; title: string; nextLevel: number } {
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
    let nextLevel = levels[1].threshold;

    for (let i = 0; i < levels.length; i++) {
      if (reputation >= levels[i].threshold) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1]?.threshold || levels[i].threshold;
      }
    }

    return {
      level: levels.indexOf(currentLevel) + 1,
      title: currentLevel.title,
      nextLevel,
    };
  }
}

/**
 * Forum component
 */
export function Forum({ category }: { category?: string }) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent');

  return (
    <div className="forum">
      <ForumHeader category={category} />
      <ForumFilters
        sortBy={sortBy}
        onSortChange={setSortBy}
        category={category}
      />
      <PostList posts={posts} />
      <NewPostButton />
    </div>
  );
}

/**
 * Template gallery component
 */
export function TemplateGallery({ category }: { category?: string }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'rating'>('trending');

  return (
    <div className="template-gallery">
      <GalleryHeader />
      <SearchBar value={search} onChange={setSearch} />
      <CategoryFilter selected={category} />
      <SortSelector value={sortBy} onChange={setSortBy} />
      <TemplateGrid templates={templates} />
      <SubmitTemplateButton />
    </div>
  );
}

/**
 * User profile component
 */
export function UserProfile({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'templates' | 'badges'>('posts');

  if (!profile) return <div>Loading...</div>;

  const level = GamificationSystem.getLevel(profile.reputation);

  return (
    <div className="user-profile">
      <ProfileHeader profile={profile} level={level} />
      <ProfileStats statistics={profile.statistics} />
      <ProfileBadges badges={profile.badges} />
      <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
      <TabContent activeTab={activeTab} profile={profile} />
    </div>
  );
}

/**
 * Notification system
 */
export class NotificationSystem {
  /**
   * Notify user of reply
   */
  static async notifyReply(postId: string, reply: ForumReply): Promise<void> {
    // Send notification to post author
    const notification = {
      type: 'reply',
      postId,
      replyId: reply.id,
      message: `${reply.author.name} replied to your post`,
    };

    await this.sendNotification(notification);
  }

  /**
   * Notify user of mention
   */
  static async notifyMention(userId: string, postId: string, mentioner: string): Promise<void> {
    const notification = {
      type: 'mention',
      postId,
      message: `${mentioner} mentioned you`,
    };

    await this.sendNotification(notification);
  }

  /**
   * Notify user of badge earned
   */
  static async notifyBadge(userId: string, badge: Badge): Promise<void> {
    const notification = {
      type: 'badge',
      badgeId: badge.id,
      message: `You earned the ${badge.name} badge!`,
    };

    await this.sendNotification(notification);
  }

  /**
   * Send notification
   */
  private static async sendNotification(notification: any): Promise<void> {
    // In production, send via WebSocket, email, or push notification
    console.log('Notification sent:', notification);
  }
}

/**
 * Sharing system
 */
export class SharingSystem {
  /**
   * Share spreadsheet to community
   */
  static async shareToCommunity(spreadsheetId: string, metadata: {
    title: string;
    description: string;
    category: string;
    tags: string[];
  }): Promise<Template> {
    // Create template entry
    const template = {
      id: generateId(),
      ...metadata,
      spreadsheetId,
      author: getCurrentUser(),
      downloads: 0,
      rating: 0,
      reviews: 0,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database
    await db.templates.create(template);

    return template;
  }

  /**
   * Rate template
   */
  static async rateTemplate(templateId: string, rating: number, review?: string): Promise<void> {
    await db.templates.addReview(templateId, {
      userId: getCurrentUser().id,
      rating,
      review,
      createdAt: new Date(),
    });
  }

  /**
   * Download template
   */
  static async downloadTemplate(templateId: string): Promise<string> {
    // Clone template to user's spreadsheets
    const template = await db.templates.findById(templateId);
    const cloned = await db.spreadsheets.clone(template.spreadsheetId);

    // Increment download count
    await db.templates.incrementDownloads(templateId);

    // Award reputation to template author
    await db.users.addReputation(template.authorId, 2);

    return cloned.id;
  }
}

/**
 * Search functionality
 */
export class CommunitySearch {
  /**
   * Search posts
   */
  static async searchPosts(query: string, filters?: {
    category?: string;
    tags?: string[];
    author?: string;
    dateRange?: { start: Date; end: Date };
  }): Promise<ForumPost[]> {
    // Full-text search with filters
    const results = await db.posts.search({
      query,
      ...filters,
    });

    return results;
  }

  /**
   * Search templates
   */
  static async searchTemplates(query: string, filters?: {
    category?: string;
    tags?: string[];
    minRating?: number;
  }): Promise<Template[]> {
    const results = await db.templates.search({
      query,
      ...filters,
    });

    return results;
  }

  /**
   * Get popular searches
   */
  static async getPopularSearches(): Promise<string[]> {
    return await db.search.getPopularQueries();
  }

  /**
   * Get search suggestions
   */
  static async getSuggestions(query: string): Promise<string[]> {
    return await db.search.getSuggestions(query);
  }
}

/**
 * Moderation system
 */
export class ModerationSystem {
  /**
   * Flag content for review
   */
  static async flagContent(contentType: 'post' | 'reply' | 'template', contentId: string, reason: string): Promise<void> {
    await db.moderation.createFlag({
      contentType,
      contentId,
      reason,
      flaggedBy: getCurrentUser().id,
      createdAt: new Date(),
    });
  }

  /**
   * Review flagged content
   */
  static async reviewFlag(flagId: string, action: 'approve' | 'reject', moderatorNote?: string): Promise<void> {
    const flag = await db.moderation.getFlag(flagId);

    if (action === 'approve') {
      // Take action on content
      if (flag.contentType === 'post') {
        await db.posts.delete(flag.contentId);
      } else if (flag.contentType === 'reply') {
        await db.replies.delete(flag.contentId);
      }

      // Warn user if necessary
      await this.warnUser(flag.flaggedBy, moderatorNote);
    }

    await db.moderation.updateFlag(flagId, {
      status: action,
      moderatorNote,
      reviewedAt: new Date(),
    });
  }

  /**
   * Warn user
   */
  private static async warnUser(userId: string, reason: string): Promise<void> {
    await db.users.addWarning(userId, {
      reason,
      warnedAt: new Date(),
    });

    // Notify user
    await NotificationSystem.sendNotification({
      type: 'warning',
      userId,
      message: `You have received a warning: ${reason}`,
    });
  }

  /**
   * Lock/unlock post
   */
  static async togglePostLock(postId: string, locked: boolean): Promise<void> {
    await db.posts.update(postId, { locked });
  }

  /**
   * Pin/unpin post
   */
  static async togglePostPin(postId: string, pinned: boolean): Promise<void> {
    await db.posts.update(postId, { pinned });
  }
}

/**
 * Helper functions
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getCurrentUser() {
  return {
    id: 'user-123',
    name: 'John Doe',
    avatar: '/avatars/default.png',
  };
}

// Mock database
const db = {
  posts: {
    search: async () => [],
  },
  templates: {
    search: async () => [],
    create: async () => {},
    findById: async () => ({}),
    clone: async () => ({}),
    incrementDownloads: async () => {},
    addReview: async () => {},
  },
  users: {
    addReputation: async () => {},
    addWarning: async () => {},
  },
  moderation: {
    createFlag: async () => {},
    getFlag: async () => ({}),
    updateFlag: async () => {},
  },
  search: {
    getPopularQueries: async () => [],
    getSuggestions: async () => [],
  },
};

/**
 * Export all community features
 */
export const CommunityFeatures = {
  Forum,
  TemplateGallery,
  UserProfile,
  NotificationSystem,
  SharingSystem,
  CommunitySearch,
  ModerationSystem,
  GamificationSystem,
};
