/**
 * Spreadsheet Moment - Content Moderation Implementation
 *
 * Complete moderation system with flagging, review, and enforcement
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

/**
 * Content flag
 */
export interface ContentFlag {
  id: string;
  contentType: 'post' | 'reply' | 'template' | 'user';
  contentId: string;
  reason: string;
  category: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'malware' | 'other';
  description: string;
  flaggedBy: string;
  flaggedByName: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  moderatorNote?: string;
  actionTaken?: string;
}

/**
 * User warning
 */
export interface UserWarning {
  id: string;
  userId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  warnedBy: string;
  warnedByName: string;
  warningType: 'formal' | 'informal';
  expiresAt?: Date;
  acknowledgedAt?: Date;
  createdAt: Date;
}

/**
 * Moderation action
 */
export interface ModerationAction {
  id: string;
  targetType: 'post' | 'reply' | 'template' | 'user';
  targetId: string;
  action: 'hide' | 'delete' | 'lock' | 'pin' | 'feature' | 'ban' | 'warn';
  reason: string;
  performedBy: string;
  performedByName: string;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Moderation queue item
 */
export interface ModerationQueueItem {
  flag: ContentFlag;
  content?: {
    id: string;
    type: string;
    title: string;
    author: string;
    createdAt: Date;
  };
  similarFlags: number;
  userFlagCount: number;
}

/**
 * Moderation manager class
 */
export class ModerationManager {
  private db: ModerationDatabase;

  constructor(database: ModerationDatabase) {
    this.db = database;
  }

  /**
   * Flag content for review
   */
  async flagContent(data: {
    contentType: ContentFlag['contentType'];
    contentId: string;
    reason: string;
    category: ContentFlag['category'];
    description: string;
    flaggedBy: string;
    flaggedByName: string;
  }): Promise<ContentFlag> {
    // Check if user already flagged this content
    const existingFlag = await this.db.getUserFlagForContent(
      data.flaggedBy,
      data.contentId
    );

    if (existingFlag) {
      throw new Error('You have already flagged this content');
    }

    // Create flag
    const flag: ContentFlag = {
      id: this.generateId(),
      contentType: data.contentType,
      contentId: data.contentId,
      reason: data.reason,
      category: data.category,
      description: data.description,
      flaggedBy: data.flaggedBy,
      flaggedByName: data.flaggedByName,
      status: 'pending',
      priority: this.calculatePriority(data.category),
      createdAt: new Date(),
    };

    await this.db.createFlag(flag);

    // Notify moderators
    await this.db.notifyModerators({
      type: 'new_flag',
      flagId: flag.id,
      priority: flag.priority,
    });

    return flag;
  }

  /**
   * Get moderation queue
   */
  async getModerationQueue(options: {
    status?: ContentFlag['status'];
    priority?: ContentFlag['priority'];
    category?: ContentFlag['category'];
    limit?: number;
    offset?: number;
  } = {}): Promise<ModerationQueueItem[]> {
    const flags = await this.db.getFlags(options);

    const queueItems: ModerationQueueItem[] = [];

    for (const flag of flags) {
      const content = await this.db.getContentForModeration(
        flag.contentType,
        flag.contentId
      );

      const similarFlags = await this.db.getSimilarFlags(flag.contentId);
      const userFlagCount = await this.db.getUserFlagCount(flag.flaggedBy);

      queueItems.push({
        flag,
        content,
        similarFlags: similarFlags.length,
        userFlagCount,
      });
    }

    // Sort by priority and date
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    queueItems.sort((a, b) => {
      const priorityDiff = priorityOrder[a.flag.priority] - priorityOrder[b.flag.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return b.flag.createdAt.getTime() - a.flag.createdAt.getTime();
    });

    const offset = options.offset || 0;
    const limit = options.limit || 20;

    return queueItems.slice(offset, offset + limit);
  }

  /**
   * Review flag
   */
  async reviewFlag(flagId: string, review: {
    action: 'approve' | 'reject';
    moderatorId: string;
    moderatorName: string;
    actionTaken?: string;
    moderatorNote?: string;
  }): Promise<ContentFlag> {
    const flag = await this.db.getFlag(flagId);

    if (!flag) {
      throw new Error('Flag not found');
    }

    if (flag.status !== 'pending' && flag.status !== 'reviewing') {
      throw new Error('Flag has already been reviewed');
    }

    // Update flag status
    const updated: ContentFlag = {
      ...flag,
      status: review.action === 'approve' ? 'approved' : 'rejected',
      reviewedAt: new Date(),
      reviewedBy: review.moderatorId,
      moderatorNote: review.moderatorNote,
      actionTaken: review.actionTaken,
    };

    await this.db.updateFlag(flagId, updated);

    // Take action if approved
    if (review.action === 'approve') {
      await this.takeEnforcementAction(flag, review.moderatorId, review.moderatorName);
    }

    // Notify flagger
    await this.db.notifyUser(flag.flaggedBy, {
      type: 'flag_review',
      flagId,
      outcome: review.action,
      note: review.moderatorNote,
    });

    return updated;
  }

  /**
   * Take enforcement action
   */
  private async takeEnforcementAction(
    flag: ContentFlag,
    moderatorId: string,
    moderatorName: string
  ): Promise<void> {
    let action: ModerationAction['action'];

    switch (flag.category) {
      case 'spam':
      case 'inappropriate':
        action = 'delete';
        break;
      case 'harassment':
        action = 'delete';
        // Add user warning
        await this.warnUser({
          userId: await this.getContentAuthorId(flag.contentType, flag.contentId),
          reason: flag.description,
          severity: 'medium',
          warnedBy: moderatorId,
          warnedByName: moderatorName,
          warningType: 'formal',
        });
        break;
      case 'copyright':
        action = 'hide';
        break;
      case 'malware':
        action = 'delete';
        // Ban user
        await this.banUser(
          await this.getContentAuthorId(flag.contentType, flag.contentId),
          moderatorId,
          flag.reason
        );
        break;
      default:
        action = 'hide';
    }

    await this.db.performAction({
      id: this.generateId(),
      targetType: flag.contentType,
      targetId: flag.contentId,
      action,
      reason: flag.reason,
      performedBy: moderatorId,
      performedByName: moderatorName,
      createdAt: new Date(),
    });
  }

  /**
   * Warn user
   */
  async warnUser(data: {
    userId: string;
    reason: string;
    severity: UserWarning['severity'];
    warnedBy: string;
    warnedByName: string;
    warningType?: UserWarning['warningType'];
    expiresAt?: Date;
  }): Promise<UserWarning> {
    const warning: UserWarning = {
      id: this.generateId(),
      userId: data.userId,
      reason: data.reason,
      severity: data.severity,
      warnedBy: data.warnedBy,
      warnedByName: data.warnedByName,
      warningType: data.warningType || 'informal',
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    };

    await this.db.createWarning(warning);

    // Notify user
    await this.db.notifyUser(data.userId, {
      type: 'warning',
      warningId: warning.id,
      message: `You have received a ${data.severity} severity warning: ${data.reason}`,
    });

    return warning;
  }

  /**
   * Ban user
   */
  async banUser(
    userId: string,
    moderatorId: string,
    reason: string
  ): Promise<void> {
    await this.db.banUser(userId, moderatorId, reason);

    // Notify user
    await this.db.notifyUser(userId, {
      type: 'ban',
      message: `Your account has been banned. Reason: ${reason}`,
    });
  }

  /**
   * Unban user
   */
  async unbanUser(userId: string, moderatorId: string): Promise<void> {
    await this.db.unbanUser(userId, moderatorId);
  }

  /**
   * Lock/unlock post
   */
  async togglePostLock(
    postId: string,
    locked: boolean,
    moderatorId: string
  ): Promise<void> {
    await this.db.performAction({
      id: this.generateId(),
      targetType: 'post',
      targetId: postId,
      action: locked ? 'lock' : 'unlock',
      reason: locked ? 'Locked by moderator' : 'Unlocked by moderator',
      performedBy: moderatorId,
      performedByName: '', // Would fetch from database
      createdAt: new Date(),
    });
  }

  /**
   * Pin/unpin post
   */
  async togglePostPin(
    postId: string,
    pinned: boolean,
    moderatorId: string
  ): Promise<void> {
    await this.db.performAction({
      id: this.generateId(),
      targetType: 'post',
      targetId: postId,
      action: pinned ? 'pin' : 'unpin',
      reason: pinned ? 'Pinned by moderator' : 'Unpinned by moderator',
      performedBy: moderatorId,
      performedByName: '', // Would fetch from database
      createdAt: new Date(),
    });
  }

  /**
   * Get user warnings
   */
  async getUserWarnings(userId: string): Promise<UserWarning[]> {
    return await this.db.getUserWarnings(userId);
  }

  /**
   * Get user flag history
   */
  async getUserFlagHistory(userId: string): Promise<ContentFlag[]> {
    return await this.db.getUserFlagHistory(userId);
  }

  /**
   * Get moderation stats
   */
  async getModerationStats(options: {
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<{
    totalFlags: number;
    pendingFlags: number;
    resolvedFlags: number;
    approvedFlags: number;
    rejectedFlags: number;
    totalWarnings: number;
    totalBans: number;
    averageResponseTime: number;
  }> {
    return await this.db.getModerationStats(options);
  }

  /**
   * Get content author ID
   */
  private async getContentAuthorId(
    contentType: string,
    contentId: string
  ): Promise<string> {
    const content = await this.db.getContentForModeration(contentType, contentId);
    return content?.author || '';
  }

  /**
   * Calculate flag priority
   */
  private calculatePriority(category: ContentFlag['category']): ContentFlag['priority'] {
    switch (category) {
      case 'malware':
        return 'urgent';
      case 'harassment':
        return 'high';
      case 'inappropriate':
        return 'medium';
      case 'spam':
        return 'medium';
      case 'copyright':
        return 'high';
      default:
        return 'low';
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `mod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Moderation database interface
 */
export interface ModerationDatabase {
  // Flags
  createFlag(flag: ContentFlag): Promise<void>;
  getFlag(flagId: string): Promise<ContentFlag | null>;
  getFlags(options: {
    status?: ContentFlag['status'];
    priority?: ContentFlag['priority'];
    category?: ContentFlag['category'];
  }): Promise<ContentFlag[]>;
  updateFlag(flagId: string, flag: ContentFlag): Promise<void>;
  getUserFlagForContent(userId: string, contentId: string): Promise<ContentFlag | null>;
  getSimilarFlags(contentId: string): Promise<ContentFlag[]>;
  getUserFlagCount(userId: string): Promise<number>;
  getUserFlagHistory(userId: string): Promise<ContentFlag[]>;

  // Warnings
  createWarning(warning: UserWarning): Promise<void>;
  getUserWarnings(userId: string): Promise<UserWarning[]>;

  // Actions
  performAction(action: ModerationAction): Promise<void>;

  // Bans
  banUser(userId: string, moderatorId: string, reason: string): Promise<void>;
  unbanUser(userId: string, moderatorId: string): Promise<void>;

  // Content
  getContentForModeration(contentType: string, contentId: string): Promise<{
    id: string;
    type: string;
    title: string;
    author: string;
    createdAt: Date;
  } | null>;

  // Stats
  getModerationStats(options: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalFlags: number;
    pendingFlags: number;
    resolvedFlags: number;
    approvedFlags: number;
    rejectedFlags: number;
    totalWarnings: number;
    totalBans: number;
    averageResponseTime: number;
  }>;

  // Notifications
  notifyModerators(notification: any): Promise<void>;
  notifyUser(userId: string, notification: any): Promise<void>;
}

/**
 * In-memory moderation database for testing
 */
export class InMemoryModerationDatabase implements ModerationDatabase {
  private flags = new Map<string, ContentFlag>();
  private warnings = new Map<string, UserWarning[]>();
  private bannedUsers = new Set<string>();
  private actions: ModerationAction[] = [];

  async createFlag(flag: ContentFlag): Promise<void> {
    this.flags.set(flag.id, flag);
  }

  async getFlag(flagId: string): Promise<ContentFlag | null> {
    return this.flags.get(flagId) || null;
  }

  async getFlags(options: {
    status?: ContentFlag['status'];
    priority?: ContentFlag['priority'];
    category?: ContentFlag['category'];
  }): Promise<ContentFlag[]> {
    let flags = Array.from(this.flags.values());

    if (options.status) {
      flags = flags.filter(f => f.status === options.status);
    }

    if (options.priority) {
      flags = flags.filter(f => f.priority === options.priority);
    }

    if (options.category) {
      flags = flags.filter(f => f.category === options.category);
    }

    return flags;
  }

  async updateFlag(flagId: string, flag: ContentFlag): Promise<void> {
    this.flags.set(flagId, flag);
  }

  async getUserFlagForContent(userId: string, contentId: string): Promise<ContentFlag | null> {
    return Array.from(this.flags.values()).find(
      f => f.flaggedBy === userId && f.contentId === contentId
    ) || null;
  }

  async getSimilarFlags(contentId: string): Promise<ContentFlag[]> {
    return Array.from(this.flags.values()).filter(f => f.contentId === contentId);
  }

  async getUserFlagCount(userId: string): Promise<number> {
    return Array.from(this.flags.values()).filter(f => f.flaggedBy === userId).length;
  }

  async getUserFlagHistory(userId: string): Promise<ContentFlag[]> {
    return Array.from(this.flags.values()).filter(f => f.flaggedBy === userId);
  }

  async createWarning(warning: UserWarning): Promise<void> {
    const warnings = this.warnings.get(warning.userId) || [];
    warnings.push(warning);
    this.warnings.set(warning.userId, warnings);
  }

  async getUserWarnings(userId: string): Promise<UserWarning[]> {
    return this.warnings.get(userId) || [];
  }

  async performAction(action: ModerationAction): Promise<void> {
    this.actions.push(action);
  }

  async banUser(userId: string, moderatorId: string, reason: string): Promise<void> {
    this.bannedUsers.add(userId);
  }

  async unbanUser(userId: string, moderatorId: string): Promise<void> {
    this.bannedUsers.delete(userId);
  }

  async getContentForModeration(contentType: string, contentId: string): Promise<{
    id: string;
    type: string;
    title: string;
    author: string;
    createdAt: Date;
  } | null> {
    // Placeholder - would fetch from appropriate database
    return {
      id: contentId,
      type: contentType,
      title: 'Sample Content',
      author: 'user-123',
      createdAt: new Date(),
    };
  }

  async getModerationStats(options: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalFlags: number;
    pendingFlags: number;
    resolvedFlags: number;
    approvedFlags: number;
    rejectedFlags: number;
    totalWarnings: number;
    totalBans: number;
    averageResponseTime: number;
  }> {
    const flags = Array.from(this.flags.values());

    return {
      totalFlags: flags.length,
      pendingFlags: flags.filter(f => f.status === 'pending').length,
      resolvedFlags: flags.filter(f => f.status === 'approved' || f.status === 'rejected').length,
      approvedFlags: flags.filter(f => f.status === 'approved').length,
      rejectedFlags: flags.filter(f => f.status === 'rejected').length,
      totalWarnings: Array.from(this.warnings.values()).reduce((sum, ws) => sum + ws.length, 0),
      totalBans: this.bannedUsers.size,
      averageResponseTime: 3600000, // 1 hour placeholder
    };
  }

  async notifyModerators(notification: any): Promise<void> {
    console.log('Moderator notification:', notification);
  }

  async notifyUser(userId: string, notification: any): Promise<void> {
    console.log(`Notification for ${userId}:`, notification);
  }
}
