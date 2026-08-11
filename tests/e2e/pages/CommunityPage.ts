import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Community Page Object Model
 * Handles forum posting, template gallery, user profiles, and badges
 */
export class CommunityPage extends BasePage {
  // Forum Locators
  readonly forumLink: string;
  readonly forumCategories: string;
  readonly forumThreads: string;
  readonly createThreadButton: string;
  readonly threadTitle: string;
  readonly threadContent: string;
  readonly threadCategory: string;
  readonly threadTags: string;
  readonly submitThreadButton: string;
  readonly threadReply: string;
  readonly submitReplyButton: string;
  readonly threadVoteUp: string;
  readonly threadVoteDown: string;
  readonly threadBookmark: string;
  readonly threadShare: string;
  readonly threadReport: string;
  readonly threadSearch: string;
  readonly threadFilter: string;
  readonly threadSort: string;
  readonly threadPagination: string;
  readonly threadAuthor: string;
  readonly threadTimestamp: string;
  readonly threadViewCount: string;
  readonly threadReplyCount: string;
  readonly threadEditButton: string;
  readonly threadDeleteButton: string;
  readonly threadCloseButton: string;
  readonly threadPinButton: string;
  readonly threadLockButton: string;

  // Template Gallery Locators
  readonly templateGalleryLink: string;
  readonly templateCategories: string;
  readonly templateSearch: string;
  readonly templateFilter: string;
  readonly templateSort: string;
  readonly templateCard: string;
  readonly templatePreview: string;
  readonly templateUseButton: string;
  readonly templateFavoriteButton: string;
  readonly templateRating: string;
  readonly templateReviews: string;
  readonly templateAuthor: string;
  readonly templateDownloads: string;
  readonly templateLastUpdated: string;
  readonly templateCompatibility: string;
  readonly templateLicense: string;
  readonly templateUploadButton: string;
  readonly templateTitle: string;
  readonly templateDescription: string;
  readonly templateFile: string;
  readonly templateThumbnail: string;
  readonly templateTags: string;
  readonly submitTemplateButton: string;

  // User Profile Locators
  readonly profileLink: string;
  readonly profileAvatar: string;
  readonly profileName: string;
  readonly profileBio: string;
  readonly profileLocation: string;
  readonly profileWebsite: string;
  readonly profileJoined: string;
  readonly profileLastActive: string;
  readonly profileThreads: string;
  readonly profileReplies: string;
  readonly profileTemplates: string;
  readonly profileBadges: string;
  readonly editProfileButton: string;
  readonly profileSettings: string;
  readonly profilePrivacy: string;
  readonly profileNotifications: string;
  readonly profileDeleteAccount: string;
  readonly profileFollowButton: string;
  readonly profileMessageButton: string;
  readonly profileActivityFeed: string;
  readonly profileAchievements: string;

  // Badge System Locators
  readonly badgeList: string;
  readonly badgeIcon: string;
  readonly badgeName: string;
  readonly badgeDescription: string;
  readonly badgeProgress: string;
  readonly badgeUnlockCriteria: string;
  readonly badgeDateEarned: string;
  readonly badgeShare: string;
  readonly badgeLeaderboard: string;
  readonly badgeRank: string;
  readonly badgePoints: string;
  readonly nextBadge: string;
  readonly badgeNotification: string;

  // Community Interaction Locators
  readonly likeButton: string;
  readonly dislikeButton: string;
  readonly followButton: string;
  readonly subscribeButton: string;
  readonly mentionInput: string;
  readonly mentionList: string;
  readonly hashtagInput: string;
  readonly hashtagList: string;
  readonly emojiPicker: string;
  readonly emojiButton: string;
  readonly attachmentButton: string;
  readonly attachmentFile: string;
  readonly attachmentImage: string;
  readonly linkPreview: string;
  readonly codeBlock: string;
  readonly quoteBlock: string;
  readonly mentionHighlight: string;
  readonly notificationBadge: string;
  readonly notificationList: string;
  readonly markAllReadButton: string;

  // Moderation Locators
  readonly moderationQueue: string;
  readonly approveButton: string;
  readonly rejectButton: string;
  readonly flagButton: string;
  readonly flagReason: string;
  readonly submitFlagButton: string;
  readonly moderatorNotes: string;
  readonly warnUserButton: string;
  readonly suspendUserButton: string;
  readonly banUserButton: string;
  readonly moderationLog: string;
  readonly moderationActions: string;
  readonly appealButton: string;

  constructor(page: Page) {
    super(page);
    // Forum
    this.forumLink = '[data-testid="forum-link"]';
    this.forumCategories = '[data-testid="forum-categories"]';
    this.forumThreads = '[data-testid="forum-threads"]';
    this.createThreadButton = '[data-testid="create-thread"]';
    this.threadTitle = '[data-testid="thread-title"]';
    this.threadContent = '[data-testid="thread-content"]';
    this.threadCategory = '[data-testid="thread-category"]';
    this.threadTags = '[data-testid="thread-tags"]';
    this.submitThreadButton = '[data-testid="submit-thread"]';
    this.threadReply = '[data-testid="thread-reply"]';
    this.submitReplyButton = '[data-testid="submit-reply"]';
    this.threadVoteUp = '[data-testid="vote-up"]';
    this.threadVoteDown = '[data-testid="vote-down"]';
    this.threadBookmark = '[data-testid="bookmark-thread"]';
    this.threadShare = '[data-testid="share-thread"]';
    this.threadReport = '[data-testid="report-thread"]';
    this.threadSearch = '[data-testid="thread-search"]';
    this.threadFilter = '[data-testid="thread-filter"]';
    this.threadSort = '[data-testid="thread-sort"]';
    this.threadPagination = '[data-testid="thread-pagination"]';
    this.threadAuthor = '[data-testid="thread-author"]';
    this.threadTimestamp = '[data-testid="thread-timestamp"]';
    this.threadViewCount = '[data-testid="thread-view-count"]';
    this.threadReplyCount = '[data-testid="thread-reply-count"]';
    this.threadEditButton = '[data-testid="edit-thread"]';
    this.threadDeleteButton = '[data-testid="delete-thread"]';
    this.threadCloseButton = '[data-testid="close-thread"]';
    this.threadPinButton = '[data-testid="pin-thread"]';
    this.threadLockButton = '[data-testid="lock-thread"]';

    // Template Gallery
    this.templateGalleryLink = '[data-testid="template-gallery-link"]';
    this.templateCategories = '[data-testid="template-categories"]';
    this.templateSearch = '[data-testid="template-search"]';
    this.templateFilter = '[data-testid="template-filter"]';
    this.templateSort = '[data-testid="template-sort"]';
    this.templateCard = '[data-testid="template-card"]';
    this.templatePreview = '[data-testid="template-preview"]';
    this.templateUseButton = '[data-testid="use-template"]';
    this.templateFavoriteButton = '[data-testid="favorite-template"]';
    this.templateRating = '[data-testid="template-rating"]';
    this.templateReviews = '[data-testid="template-reviews"]';
    this.templateAuthor = '[data-testid="template-author"]';
    this.templateDownloads = '[data-testid="template-downloads"]';
    this.templateLastUpdated = '[data-testid="template-last-updated"]';
    this.templateCompatibility = '[data-testid="template-compatibility"]';
    this.templateLicense = '[data-testid="template-license"]';
    this.templateUploadButton = '[data-testid="upload-template"]';
    this.templateTitle = '[data-testid="template-title"]';
    this.templateDescription = '[data-testid="template-description"]';
    this.templateFile = '[data-testid="template-file"]';
    this.templateThumbnail = '[data-testid="template-thumbnail"]';
    this.templateTags = '[data-testid="template-tags"]';
    this.submitTemplateButton = '[data-testid="submit-template"]';

    // User Profile
    this.profileLink = '[data-testid="profile-link"]';
    this.profileAvatar = '[data-testid="profile-avatar"]';
    this.profileName = '[data-testid="profile-name"]';
    this.profileBio = '[data-testid="profile-bio"]';
    this.profileLocation = '[data-testid="profile-location"]';
    this.profileWebsite = '[data-testid="profile-website"]';
    this.profileJoined = '[data-testid="profile-joined"]';
    this.profileLastActive = '[data-testid="profile-last-active"]';
    this.profileThreads = '[data-testid="profile-threads"]';
    this.profileReplies = '[data-testid="profile-replies"]';
    this.profileTemplates = '[data-testid="profile-templates"]';
    this.profileBadges = '[data-testid="profile-badges"]';
    this.editProfileButton = '[data-testid="edit-profile"]';
    this.profileSettings = '[data-testid="profile-settings"]';
    this.profilePrivacy = '[data-testid="profile-privacy"]';
    this.profileNotifications = '[data-testid="profile-notifications"]';
    this.profileDeleteAccount = '[data-testid="delete-account"]';
    this.profileFollowButton = '[data-testid="follow-user"]';
    this.profileMessageButton = '[data-testid="message-user"]';
    this.profileActivityFeed = '[data-testid="activity-feed"]';
    this.profileAchievements = '[data-testid="achievements"]';

    // Badges
    this.badgeList = '[data-testid="badge-list"]';
    this.badgeIcon = '[data-testid="badge-icon"]';
    this.badgeName = '[data-testid="badge-name"]';
    this.badgeDescription = '[data-testid="badge-description"]';
    this.badgeProgress = '[data-testid="badge-progress"]';
    this.badgeUnlockCriteria = '[data-testid="badge-criteria"]';
    this.badgeDateEarned = '[data-testid="badge-date-earned"]';
    this.badgeShare = '[data-testid="share-badge"]';
    this.badgeLeaderboard = '[data-testid="badge-leaderboard"]';
    this.badgeRank = '[data-testid="badge-rank"]';
    this.badgePoints = '[data-testid="badge-points"]';
    this.nextBadge = '[data-testid="next-badge"]';
    this.badgeNotification = '[data-testid="badge-notification"]';

    // Community Interaction
    this.likeButton = '[data-testid="like-button"]';
    this.dislikeButton = '[data-testid="dislike-button"]';
    this.followButton = '[data-testid="follow-button"]';
    this.subscribeButton = '[data-testid="subscribe-button"]';
    this.mentionInput = '[data-testid="mention-input"]';
    this.mentionList = '[data-testid="mention-list"]';
    this.hashtagInput = '[data-testid="hashtag-input"]';
    this.hashtagList = '[data-testid="hashtag-list"]';
    this.emojiPicker = '[data-testid="emoji-picker"]';
    this.emojiButton = '[data-testid="emoji-button"]';
    this.attachmentButton = '[data-testid="attachment-button"]';
    this.attachmentFile = '[data-testid="attachment-file"]';
    this.attachmentImage = '[data-testid="attachment-image"]';
    this.linkPreview = '[data-testid="link-preview"]';
    this.codeBlock = '[data-testid="code-block"]';
    this.quoteBlock = '[data-testid="quote-block"]';
    this.mentionHighlight = '[data-testid="mention-highlight"]';
    this.notificationBadge = '[data-testid="notification-badge"]';
    this.notificationList = '[data-testid="notification-list"]';
    this.markAllReadButton = '[data-testid="mark-all-read"]';

    // Moderation
    this.moderationQueue = '[data-testid="moderation-queue"]';
    this.approveButton = '[data-testid="approve"]';
    this.rejectButton = '[data-testid="reject"]';
    this.flagButton = '[data-testid="flag"]';
    this.flagReason = '[data-testid="flag-reason"]';
    this.submitFlagButton = '[data-testid="submit-flag"]';
    this.moderatorNotes = '[data-testid="moderator-notes"]';
    this.warnUserButton = '[data-testid="warn-user"]';
    this.suspendUserButton = '[data-testid="suspend-user"]';
    this.banUserButton = '[data-testid="ban-user"]';
    this.moderationLog = '[data-testid="moderation-log"]';
    this.moderationActions = '[data-testid="moderation-actions"]';
    this.appealButton = '[data-testid="appeal"]';
  }

  /**
   * Navigate to forum
   */
  async gotoForum(): Promise<void> {
    await this.goto('/community/forum');
    await this.waitForLoadState();
  }

  /**
   * Navigate to specific category
   */
  async gotoForumCategory(categoryId: string): Promise<void> {
    await this.goto(`/community/forum/category/${categoryId}`);
    await this.waitForLoadState();
  }

  /**
   * Navigate to specific thread
   */
  async gotoThread(threadId: string): Promise<void> {
    await this.goto(`/community/forum/thread/${threadId}`);
    await this.waitForLoadState();
  }

  /**
   * Create forum thread
   */
  async createThread(title: string, content: string, category: string, tags: string[]): Promise<void> {
    await this.gotoForum();
    await this.click(this.createThreadButton);
    await this.fill(this.threadTitle, title);
    await this.fill(this.threadContent, content);
    await this.selectOption(this.threadCategory, category);
    for (const tag of tags) {
      await this.fill(this.threadTags, tag);
      await this.keyboardPress('Enter');
    }
    await this.click(this.submitThreadButton);
    await this.waitForLoadState();
  }

  /**
   * Reply to thread
   */
  async replyToThread(threadId: string, replyContent: string): Promise<void> {
    await this.gotoThread(threadId);
    await this.fill(this.threadReply, replyContent);
    await this.click(this.submitReplyButton);
    await this.wait(1000);
  }

  /**
   * Vote on thread
   */
  async voteThread(threadId: string, voteUp: boolean): Promise<void> {
    await this.gotoThread(threadId);
    if (voteUp) {
      await this.click(this.threadVoteUp);
    } else {
      await this.click(this.threadVoteDown);
    }
    await this.wait(500);
  }

  /**
   * Bookmark thread
   */
  async bookmarkThread(threadId: string): Promise<void> {
    await this.gotoThread(threadId);
    await this.click(this.threadBookmark);
    await this.wait(500);
  }

  /**
   * Share thread
   */
  async shareThread(threadId: string): Promise<void> {
    await this.gotoThread(threadId);
    await this.click(this.threadShare);
    await this.wait(500);
  }

  /**
   * Report thread
   */
  async reportThread(threadId: string, reason: string): Promise<void> {
    await this.gotoThread(threadId);
    await this.click(this.threadReport);
    await this.fill(this.flagReason, reason);
    await this.click(this.submitFlagButton);
    await this.wait(500);
  }

  /**
   * Search threads
   */
  async searchThreads(searchTerm: string): Promise<void> {
    await this.gotoForum();
    await this.fill(this.threadSearch, searchTerm);
    await this.keyboardPress('Enter');
    await this.wait(1000);
  }

  /**
   * Filter threads
   */
  async filterThreads(filter: string): Promise<void> {
    await this.selectOption(this.threadFilter, filter);
    await this.wait(1000);
  }

  /**
   * Sort threads
   */
  async sortThreads(sort: 'latest' | 'popular' | 'unanswered'): Promise<void> {
    await this.selectOption(this.threadSort, sort);
    await this.wait(1000);
  }

  /**
   * Edit thread
   */
  async editThread(threadId: string, newTitle: string, newContent: string): Promise<void> {
    await this.gotoThread(threadId);
    await this.click(this.threadEditButton);
    await this.clear(this.threadTitle);
    await this.fill(this.threadTitle, newTitle);
    await this.clear(this.threadContent);
    await this.fill(this.threadContent, newContent);
    await this.click(this.submitThreadButton);
    await this.wait(1000);
  }

  /**
   * Delete thread
   */
  async deleteThread(threadId: string): Promise<void> {
    await this.gotoThread(threadId);
    await this.click(this.threadDeleteButton);
    await this.click('[data-testid="confirm-delete"]');
    await this.wait(1000);
  }

  /**
   * Pin thread
   */
  async pinThread(threadId: string): Promise<void> {
    await this.gotoThread(threadId);
    await this.click(this.threadPinButton);
    await this.wait(500);
  }

  /**
   * Lock thread
   */
  async lockThread(threadId: string): Promise<void> {
    await this.gotoThread(threadId);
    await this.click(this.threadLockButton);
    await this.wait(500);
  }

  /**
   * Navigate to template gallery
   */
  async gotoTemplateGallery(): Promise<void> {
    await this.goto('/community/templates');
    await this.waitForLoadState();
  }

  /**
   * View template preview
   */
  async viewTemplatePreview(templateId: string): Promise<void> {
    await this.click(`[data-template="${templateId}"] ${this.templatePreview}`);
    await this.wait(1000);
  }

  /**
   * Use template
   */
  async useTemplate(templateId: string): Promise<void> {
    await this.click(`[data-template="${templateId}"] ${this.templateUseButton}`);
    await this.wait(2000);
  }

  /**
   * Favorite template
   */
  async favoriteTemplate(templateId: string): Promise<void> {
    await this.click(`[data-template="${templateId}"] ${this.templateFavoriteButton}`);
    await this.wait(500);
  }

  /**
   * Rate template
   */
  async rateTemplate(templateId: string, rating: number): Promise<void> {
    await this.click(`[data-template="${templateId}"] [data-rating="${rating}"]`);
    await this.wait(500);
  }

  /**
   * Search templates
   */
  async searchTemplates(searchTerm: string): Promise<void> {
    await this.gotoTemplateGallery();
    await this.fill(this.templateSearch, searchTerm);
    await this.keyboardPress('Enter');
    await this.wait(1000);
  }

  /**
   * Filter templates
   */
  async filterTemplates(category: string): Promise<void> {
    await this.selectOption(this.templateFilter, category);
    await this.wait(1000);
  }

  /**
   * Sort templates
   */
  async sortTemplates(sort: 'popular' | 'newest' | 'top-rated'): Promise<void> {
    await this.selectOption(this.templateSort, sort);
    await this.wait(1000);
  }

  /**
   * Upload template
   */
  async uploadTemplate(title: string, description: string, filePath: string, tags: string[]): Promise<void> {
    await this.gotoTemplateGallery();
    await this.click(this.templateUploadButton);
    await this.fill(this.templateTitle, title);
    await this.fill(this.templateDescription, description);
    await this.upload(this.templateFile, filePath);
    for (const tag of tags) {
      await this.fill(this.templateTags, tag);
      await this.keyboardPress('Enter');
    }
    await this.click(this.submitTemplateButton);
    await this.wait(2000);
  }

  /**
   * Navigate to user profile
   */
  async gotoProfile(username: string): Promise<void> {
    await this.goto(`/community/profile/${username}`);
    await this.waitForLoadState();
  }

  /**
   * Navigate to own profile
   */
  async gotoMyProfile(): Promise<void> {
    await this.goto('/community/profile');
    await this.waitForLoadState();
  }

  /**
   * Edit profile
   */
  async editProfile(updates: {
    name?: string;
    bio?: string;
    location?: string;
    website?: string;
  }): Promise<void> {
    await this.gotoMyProfile();
    await this.click(this.editProfileButton);
    if (updates.name) {
      await this.clear(this.profileName);
      await this.fill(this.profileName, updates.name);
    }
    if (updates.bio) {
      await this.clear(this.profileBio);
      await this.fill(this.profileBio, updates.bio);
    }
    if (updates.location) {
      await this.clear(this.profileLocation);
      await this.fill(this.profileLocation, updates.location);
    }
    if (updates.website) {
      await this.clear(this.profileWebsite);
      await this.fill(this.profileWebsite, updates.website);
    }
    await this.click('[data-testid="save-profile"]');
    await this.wait(1000);
  }

  /**
   * Follow user
   */
  async followUser(username: string): Promise<void> {
    await this.gotoProfile(username);
    await this.click(this.profileFollowButton);
    await this.wait(500);
  }

  /**
   * Message user
   */
  async messageUser(username: string, message: string): Promise<void> {
    await this.gotoProfile(username);
    await this.click(this.profileMessageButton);
    await this.fill('[data-testid="message-content"]', message);
    await this.click('[data-testid="send-message"]');
    await this.wait(1000);
  }

  /**
   * View badges
   */
  async viewBadges(): Promise<void> {
    await this.gotoMyProfile();
    await this.scrollToElement(this.profileBadges);
    await this.verifyVisible(this.badgeList);
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    await this.viewBadges();
    return await this.getElementCount(this.badgeIcon);
  }

  /**
   * Verify badge earned
   */
  async verifyBadgeEarned(badgeName: string): Promise<void> {
    await this.viewBadges();
    await this.verifyVisible(`[data-badge="${badgeName}"]`);
  }

  /**
   * Get badge progress
   */
  async getBadgeProgress(badgeName: string): Promise<number> {
    await this.viewBadges();
    const progressText = await this.getText(`[data-badge="${badgeName}"] ${this.badgeProgress}`);
    const progress = parseInt(progressText.match(/\d+/)?.[0] || '0');
    return progress;
  }

  /**
   * Share badge
   */
  async shareBadge(badgeName: string): Promise<void> {
    await this.viewBadges();
    await this.click(`[data-badge="${badgeName}"] ${this.badgeShare}`);
    await this.wait(500);
  }

  /**
   * View leaderboard
   */
  async viewLeaderboard(): Promise<void> {
    await this.goto('/community/leaderboard');
    await this.waitForLoadState();
    await this.verifyVisible(this.badgeLeaderboard);
  }

  /**
   * Get leaderboard rank
   */
  async getLeaderboardRank(username: string): Promise<number> {
    await this.viewLeaderboard();
    const rankText = await this.getText(`[data-user="${username}"] ${this.badgeRank}`);
    return parseInt(rankText);
  }

  /**
   * Add emoji to reply
   */
  async addEmoji(emoji: string): Promise<void> {
    await this.click(this.emojiButton);
    await this.click(`${this.emojiPicker} [data-emoji="${emoji}"]`);
    await this.wait(500);
  }

  /**
   * Add mention
   */
  async addMention(username: string): Promise<void> {
    await this.fill(this.mentionInput, `@${username}`);
    await this.wait(500);
    await this.click(`${this.mentionList} [data-username="${username}"]`);
  }

  /**
   * Add hashtag
   */
  async addHashtag(tag: string): Promise<void> {
    await this.fill(this.hashtagInput, `#${tag}`);
    await this.wait(500);
    await this.click(`${this.hashtagList} [data-tag="${tag}"]`);
  }

  /**
   * Add attachment
   */
  async addAttachment(filePath: string): Promise<void> {
    await this.click(this.attachmentButton);
    await this.upload(this.attachmentFile, filePath);
    await this.wait(1000);
  }

  /**
   * Add code block
   */
  async addCodeBlock(code: string, language: string): Promise<void> {
    await this.click('[data-testid="insert-code"]');
    await this.selectOption('[data-testid="code-language"]', language);
    await this.fill('[data-testid="code-content"]', code);
    await this.click('[data-testid="insert-code-block"]');
    await this.wait(500);
  }

  /**
   * Add quote
   */
  async addQuote(quoteText: string): Promise<void> {
    await this.click('[data-testid="insert-quote"]');
    await this.fill('[data-testid="quote-content"]', quoteText);
    await this.click('[data-testid="insert-quote-block"]');
    await this.wait(500);
  }

  /**
   * View notifications
   */
  async viewNotifications(): Promise<void> {
    await this.click(this.notificationBadge);
    await this.verifyVisible(this.notificationList);
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<void> {
    await this.viewNotifications();
    await this.click(this.markAllReadButton);
    await this.wait(500);
  }

  /**
   * Get notification count
   */
  async getNotificationCount(): Promise<number> {
    const badgeText = await this.getText(this.notificationBadge);
    return parseInt(badgeText) || 0;
  }

  /**
   * Subscribe to thread
   */
  async subscribeToThread(threadId: string): Promise<void> {
    await this.gotoThread(threadId);
    await this.click(this.subscribeButton);
    await this.wait(500);
  }

  /**
   * View activity feed
   */
  async viewActivityFeed(username: string): Promise<void> {
    await this.gotoProfile(username);
    await this.scrollToElement(this.profileActivityFeed);
    await this.verifyVisible(this.profileActivityFeed);
  }

  /**
   * Get thread view count
   */
  async getThreadViewCount(threadId: string): Promise<number> {
    await this.gotoThread(threadId);
    const viewCountText = await this.getText(this.threadViewCount);
    return parseInt(viewCountText.replace(/,/g, ''));
  }

  /**
   * Get thread reply count
   */
  async getThreadReplyCount(threadId: string): Promise<number> {
    await this.gotoThread(threadId);
    const replyCountText = await this.getText(this.threadReplyCount);
    return parseInt(replyCountText);
  }

  /**
   * Get template download count
   */
  async getTemplateDownloadCount(templateId: string): Promise<number> {
    await this.gotoTemplateGallery();
    const downloadCountText = await this.getText(`[data-template="${templateId}"] ${this.templateDownloads}`);
    return parseInt(downloadCountText.replace(/,/g, ''));
  }

  /**
   * Get template rating
   */
  async getTemplateRating(templateId: string): Promise<number> {
    await this.gotoTemplateGallery();
    const ratingText = await this.getText(`[data-template="${templateId}"] ${this.templateRating}`);
    return parseFloat(ratingText);
  }

  /**
   * Verify user followed
   */
  async verifyUserFollowed(username: string): Promise<void> {
    await this.gotoProfile(username);
    await this.verifyTextEquals(this.profileFollowButton, 'Unfollow');
  }

  /**
   * Verify thread bookmarked
   */
  async verifyThreadBookmarked(threadId: string): Promise<void> {
    await this.gotoThread(threadId);
    await this.verifyHasClass(this.threadBookmark, 'active');
  }

  /**
   * Verify template favorited
   */
  async verifyTemplateFavorited(templateId: string): Promise<void> {
    await this.gotoTemplateGallery();
    await this.verifyHasClass(`[data-template="${templateId}"] ${this.templateFavoriteButton}`, 'active');
  }

  /**
   * Verify badge notification
   */
  async verifyBadgeNotification(badgeName: string): Promise<void> {
    await this.viewNotifications();
    await this.verifyVisible(`${this.notificationList} [data-badge="${badgeName}"]`);
  }

  /**
   * Delete account
   */
  async deleteAccount(): Promise<void> {
    await this.gotoMyProfile();
    await this.goto('/settings/account');
    await this.click(this.profileDeleteAccount);
    await this.fill('[data-testid="delete-confirmation"]', 'DELETE');
    await this.click('[data-testid="confirm-delete-account"]');
    await this.wait(2000);
  }

  /**
   * Appeal moderation action
   */
  async appealModerationAction(actionId: string, appealReason: string): Promise<void> {
    await this.goto('/community/appeals');
    await this.click(`[data-action="${actionId}"] ${this.appealButton}`);
    await this.fill('[data-testid="appeal-reason"]', appealReason);
    await this.click('[data-testid="submit-appeal"]');
    await this.wait(1000);
  }

  /**
   * View moderation queue (moderator only)
   */
  async viewModerationQueue(): Promise<void> {
    await this.goto('/community/moderation');
    await this.verifyVisible(this.moderationQueue);
  }

  /**
   * Approve queued item (moderator only)
   */
  async approveQueuedItem(itemId: string): Promise<void> {
    await this.viewModerationQueue();
    await this.click(`[data-item="${itemId}"] ${this.approveButton}`);
    await this.wait(500);
  }

  /**
   * Reject queued item (moderator only)
   */
  async rejectQueuedItem(itemId: string, reason: string): Promise<void> {
    await this.viewModerationQueue();
    await this.click(`[data-item="${itemId}"] ${this.rejectButton}`);
    await this.fill(this.flagReason, reason);
    await this.click('[data-testid="confirm-reject"]');
    await this.wait(500);
  }

  /**
   * Warn user (moderator only)
   */
  async warnUser(username: string, warningReason: string): Promise<void> {
    await this.gotoProfile(username);
    await this.click(this.warnUserButton);
    await this.fill('[data-testid="warning-reason"]', warningReason);
    await this.click('[data-testid="send-warning"]');
    await this.wait(1000);
  }
}
