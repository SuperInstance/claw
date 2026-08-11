/**
 * Spreadsheet Moment - Forum Implementation
 *
 * Complete discussion forum with categories, tags, voting, and replies
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { ForumPost, ForumReply } from './CommunityFeatures';

/**
 * Forum categories
 */
export const FORUM_CATEGORIES = [
  { id: 'general', name: 'General Discussion', icon: '💬', description: 'General topics and chat' },
  { id: 'help', name: 'Help & Support', icon: '❓', description: 'Get help with spreadsheets' },
  { id: 'templates', name: 'Templates', icon: '📊', description: 'Share and discuss templates' },
  { id: 'features', name: 'Feature Requests', icon: '💡', description: 'Suggest new features' },
  { id: 'bugs', name: 'Bug Reports', icon: '🐛', description: 'Report and track bugs' },
  { id: 'announcements', name: 'Announcements', icon: '📢', description: 'Official announcements' },
] as const;

export type ForumCategory = typeof FORUM_CATEGORIES[number]['id'];

/**
 * Popular tags
 */
export const POPULAR_TAGS = [
  'formulas', 'charts', 'pivot-tables', 'macros', 'collaboration',
  'import-export', 'formatting', 'data-analysis', 'automation', 'templates',
  'tutorial', 'troubleshooting', 'best-practices', 'tips-tricks', 'integration'
];

/**
 * Forum manager class
 */
export class ForumManager {
  private db: ForumDatabase;

  constructor(database: ForumDatabase) {
    this.db = database;
  }

  /**
   * Create a new forum post
   */
  async createPost(data: {
    title: string;
    content: string;
    category: ForumCategory;
    tags: string[];
    authorId: string;
    authorName: string;
    authorAvatar: string;
  }): Promise<ForumPost> {
    const post: ForumPost = {
      id: this.generateId(),
      title: data.title,
      content: data.content,
      author: {
        id: data.authorId,
        name: data.authorName,
        avatar: data.authorAvatar,
        reputation: await this.db.getUserReputation(data.authorId),
      },
      category: data.category,
      tags: data.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      votes: 0,
      replies: [],
      pinned: false,
      locked: false,
    };

    await this.db.createPost(post);

    // Award reputation for posting
    await this.db.addReputation(data.authorId, 10);

    return post;
  }

  /**
   * Get posts with filtering and sorting
   */
  async getPosts(options: {
    category?: ForumCategory;
    sortBy?: 'recent' | 'popular' | 'unanswered';
    tags?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<ForumPost[]> {
    let posts = await this.db.getPosts(options.category);

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      posts = posts.filter(post =>
        options.tags!.some(tag => post.tags.includes(tag))
      );
    }

    // Sort posts
    switch (options.sortBy) {
      case 'popular':
        posts.sort((a, b) => b.votes - a.votes);
        break;
      case 'unanswered':
        posts = posts.filter(post => post.replies.length === 0);
        posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'recent':
      default:
        posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    // Pagination
    const offset = options.offset || 0;
    const limit = options.limit || 20;
    return posts.slice(offset, offset + limit);
  }

  /**
   * Get a single post with replies
   */
  async getPost(postId: string): Promise<ForumPost | null> {
    const post = await this.db.getPost(postId);

    if (post) {
      // Increment view count
      await this.db.incrementViews(postId);
      post.views++;
    }

    return post;
  }

  /**
   * Update a post
   */
  async updatePost(postId: string, updates: {
    title?: string;
    content?: string;
    tags?: string[];
  }): Promise<ForumPost | null> {
    const post = await this.db.getPost(postId);

    if (!post) {
      return null;
    }

    // Check if post is locked
    if (post.locked) {
      throw new Error('Cannot edit a locked post');
    }

    const updated = await this.db.updatePost(postId, {
      ...updates,
      updatedAt: new Date(),
    });

    return updated;
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<boolean> {
    return await this.db.deletePost(postId);
  }

  /**
   * Vote on a post
   */
  async votePost(postId: string, userId: string, vote: 1 | -1): Promise<ForumPost | null> {
    const post = await this.db.getPost(postId);

    if (!post) {
      return null;
    }

    // Check if user already voted
    const existingVote = await this.db.getUserVote(postId, userId);

    if (existingVote === vote) {
      // Remove vote
      await this.db.removeVote(postId, userId);
      post.votes -= vote;
    } else if (existingVote !== undefined) {
      // Change vote
      await this.db.updateVote(postId, userId, vote);
      post.votes += vote * 2; // Remove old, add new
    } else {
      // New vote
      await this.db.addVote(postId, userId, vote);
      post.votes += vote;

      // Award reputation to post author
      if (vote === 1) {
        await this.db.addReputation(post.author.id, 10);
      }
    }

    return await this.db.getPost(postId);
  }

  /**
   * Add a reply to a post
   */
  async addReply(postId: string, data: {
    content: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
  }): Promise<ForumReply> {
    const post = await this.db.getPost(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.locked) {
      throw new Error('Cannot reply to a locked post');
    }

    const reply: ForumReply = {
      id: this.generateId(),
      content: data.content,
      author: {
        id: data.authorId,
        name: data.authorName,
        avatar: data.authorAvatar,
        reputation: await this.db.getUserReputation(data.authorId),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 0,
      accepted: false,
    };

    await this.db.addReply(postId, reply);

    // Award reputation for replying
    await this.db.addReputation(data.authorId, 5);

    // Notify post author
    await this.db.notifyUser(post.author.id, {
      type: 'reply',
      postId,
      replyId: reply.id,
      message: `${data.authorName} replied to your post`,
    });

    return reply;
  }

  /**
   * Vote on a reply
   */
  async voteReply(postId: string, replyId: string, userId: string, vote: 1 | -1): Promise<ForumReply | null> {
    const reply = await this.db.getReply(postId, replyId);

    if (!reply) {
      return null;
    }

    const existingVote = await this.db.getUserReplyVote(replyId, userId);

    if (existingVote === vote) {
      await this.db.removeReplyVote(replyId, userId);
      reply.votes -= vote;
    } else if (existingVote !== undefined) {
      await this.db.updateReplyVote(replyId, userId, vote);
      reply.votes += vote * 2;
    } else {
      await this.db.addReplyVote(replyId, userId, vote);
      reply.votes += vote;

      if (vote === 1) {
        await this.db.addReputation(reply.author.id, 10);
      }
    }

    return await this.db.getReply(postId, replyId);
  }

  /**
   * Accept a reply as the answer
   */
  async acceptReply(postId: string, replyId: string, userId: string): Promise<ForumPost | null> {
    const post = await this.db.getPost(postId);

    if (!post) {
      return null;
    }

    // Only post author can accept
    if (post.author.id !== userId) {
      throw new Error('Only post author can accept answers');
    }

    // Unaccept previous answer
    if (post.acceptedAnswer) {
      await this.db.updateReply(postId, post.acceptedAnswer, { accepted: false });
    }

    // Accept new answer
    await this.db.updateReply(postId, replyId, { accepted: true });
    await this.db.updatePost(postId, { acceptedAnswer: replyId });

    // Award bonus reputation
    const reply = await this.db.getReply(postId, replyId);
    if (reply) {
      await this.db.addReputation(reply.author.id, 25);
    }

    return await this.db.getPost(postId);
  }

  /**
   * Update a reply
   */
  async updateReply(postId: string, replyId: string, content: string): Promise<ForumReply | null> {
    return await this.db.updateReply(postId, replyId, {
      content,
      updatedAt: new Date(),
    });
  }

  /**
   * Delete a reply
   */
  async deleteReply(postId: string, replyId: string): Promise<boolean> {
    return await this.db.deleteReply(postId, replyId);
  }

  /**
   * Search posts
   */
  async searchPosts(query: string, filters: {
    category?: ForumCategory;
    tags?: string[];
  } = {}): Promise<ForumPost[]> {
    return await this.db.searchPosts(query, filters);
  }

  /**
   * Get popular tags
   */
  async getPopularTags(limit: number = 20): Promise<Array<{ tag: string; count: number }>> {
    return await this.db.getPopularTags(limit);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Forum database interface
 */
export interface ForumDatabase {
  // Posts
  createPost(post: ForumPost): Promise<void>;
  getPost(postId: string): Promise<ForumPost | null>;
  getPosts(category?: ForumCategory): Promise<ForumPost[]>;
  updatePost(postId: string, updates: Partial<ForumPost>): Promise<ForumPost | null>;
  deletePost(postId: string): Promise<boolean>;
  incrementViews(postId: string): Promise<void>;

  // Votes
  addVote(postId: string, userId: string, vote: 1 | -1): Promise<void>;
  removeVote(postId: string, userId: string): Promise<void>;
  updateVote(postId: string, userId: string, vote: 1 | -1): Promise<void>;
  getUserVote(postId: string, userId: string): Promise<1 | -1 | undefined>;

  // Replies
  addReply(postId: string, reply: ForumReply): Promise<void>;
  getReply(postId: string, replyId: string): Promise<ForumReply | null>;
  updateReply(postId: string, replyId: string, updates: Partial<ForumReply>): Promise<ForumReply | null>;
  deleteReply(postId: string, replyId: string): Promise<boolean>;

  // Reply votes
  addReplyVote(replyId: string, userId: string, vote: 1 | -1): Promise<void>;
  removeReplyVote(replyId: string, userId: string): Promise<void>;
  updateReplyVote(replyId: string, userId: string, vote: 1 | -1): Promise<void>;
  getUserReplyVote(replyId: string, userId: string): Promise<1 | -1 | undefined>;

  // Search
  searchPosts(query: string, filters: { category?: ForumCategory; tags?: string[] }): Promise<ForumPost[]>;
  getPopularTags(limit: number): Promise<Array<{ tag: string; count: number }>>;

  // User reputation
  getUserReputation(userId: string): Promise<number>;
  addReputation(userId: string, amount: number): Promise<void>;

  // Notifications
  notifyUser(userId: string, notification: any): Promise<void>;
}

/**
 * In-memory forum database for testing
 */
export class InMemoryForumDatabase implements ForumDatabase {
  private posts = new Map<string, ForumPost>();
  private replies = new Map<string, ForumReply[]>();
  private postVotes = new Map<string, Map<string, 1 | -1>>();
  private replyVotes = new Map<string, Map<string, 1 | -1>>();
  private userReputation = new Map<string, number>();

  async createPost(post: ForumPost): Promise<void> {
    this.posts.set(post.id, post);
    this.replies.set(post.id, []);
  }

  async getPost(postId: string): Promise<ForumPost | null> {
    const post = this.posts.get(postId);
    if (!post) return null;

    return {
      ...post,
      replies: this.replies.get(postId) || [],
    };
  }

  async getPosts(category?: string): Promise<ForumPost[]> {
    let posts = Array.from(this.posts.values());

    if (category) {
      posts = posts.filter(post => post.category === category);
    }

    return posts.map(post => ({
      ...post,
      replies: this.replies.get(post.id) || [],
    }));
  }

  async updatePost(postId: string, updates: Partial<ForumPost>): Promise<ForumPost | null> {
    const post = this.posts.get(postId);
    if (!post) return null;

    const updated = { ...post, ...updates };
    this.posts.set(postId, updated);
    return updated;
  }

  async deletePost(postId: string): Promise<boolean> {
    this.posts.delete(postId);
    this.replies.delete(postId);
    return true;
  }

  async incrementViews(postId: string): Promise<void> {
    const post = this.posts.get(postId);
    if (post) {
      post.views++;
    }
  }

  async addVote(postId: string, userId: string, vote: 1 | -1): Promise<void> {
    if (!this.postVotes.has(postId)) {
      this.postVotes.set(postId, new Map());
    }
    this.postVotes.get(postId)!.set(userId, vote);
  }

  async removeVote(postId: string, userId: string): Promise<void> {
    this.postVotes.get(postId)?.delete(userId);
  }

  async updateVote(postId: string, userId: string, vote: 1 | -1): Promise<void> {
    this.postVotes.get(postId)?.set(userId, vote);
  }

  async getUserVote(postId: string, userId: string): Promise<1 | -1 | undefined> {
    return this.postVotes.get(postId)?.get(userId);
  }

  async addReply(postId: string, reply: ForumReply): Promise<void> {
    const replies = this.replies.get(postId) || [];
    replies.push(reply);
    this.replies.set(postId, replies);
  }

  async getReply(postId: string, replyId: string): Promise<ForumReply | null> {
    const replies = this.replies.get(postId) || [];
    return replies.find(r => r.id === replyId) || null;
  }

  async updateReply(postId: string, replyId: string, updates: Partial<ForumReply>): Promise<ForumReply | null> {
    const replies = this.replies.get(postId) || [];
    const index = replies.findIndex(r => r.id === replyId);

    if (index === -1) return null;

    replies[index] = { ...replies[index], ...updates };
    this.replies.set(postId, replies);
    return replies[index];
  }

  async deleteReply(postId: string, replyId: string): Promise<boolean> {
    const replies = this.replies.get(postId) || [];
    const filtered = replies.filter(r => r.id !== replyId);
    this.replies.set(postId, filtered);
    return true;
  }

  async addReplyVote(replyId: string, userId: string, vote: 1 | -1): Promise<void> {
    if (!this.replyVotes.has(replyId)) {
      this.replyVotes.set(replyId, new Map());
    }
    this.replyVotes.get(replyId)!.set(userId, vote);
  }

  async removeReplyVote(replyId: string, userId: string): Promise<void> {
    this.replyVotes.get(replyId)?.delete(userId);
  }

  async updateReplyVote(replyId: string, userId: string, vote: 1 | -1): Promise<void> {
    this.replyVotes.get(replyId)?.set(userId, vote);
  }

  async getUserReplyVote(replyId: string, userId: string): Promise<1 | -1 | undefined> {
    return this.replyVotes.get(replyId)?.get(userId);
  }

  async searchPosts(query: string, filters: { category?: string; tags?: string[] }): Promise<ForumPost[]> {
    const lowerQuery = query.toLowerCase();
    let posts = Array.from(this.posts.values());

    posts = posts.filter(post =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.content.toLowerCase().includes(lowerQuery)
    );

    if (filters.category) {
      posts = posts.filter(post => post.category === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      posts = posts.filter(post =>
        filters.tags!.some(tag => post.tags.includes(tag))
      );
    }

    return posts;
  }

  async getPopularTags(limit: number): Promise<Array<{ tag: string; count: number }>> {
    const tagCounts = new Map<string, number>();

    for (const post of this.posts.values()) {
      for (const tag of post.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getUserReputation(userId: string): Promise<number> {
    return this.userReputation.get(userId) || 0;
  }

  async addReputation(userId: string, amount: number): Promise<void> {
    const current = this.userReputation.get(userId) || 0;
    this.userReputation.set(userId, Math.max(0, current + amount));
  }

  async notifyUser(userId: string, notification: any): Promise<void> {
    console.log(`Notification for ${userId}:`, notification);
  }
}
