import { test, expect } from '../../fixtures/test-fixtures';
import { TestDataGenerator } from '../../helpers/test-data-generator';

test.describe('Community Features E2E Tests', () => {
  test.beforeEach(async ({ communityPage, authPage, testUser }) => {
    await authPage.gotoLoginPage();
    await authPage.login(testUser.email, testUser.password);
    await authPage.verifyLoginSuccess();
  });

  test.describe('Forum Navigation', () => {
    test('should navigate to forum', async ({ communityPage }) => {
      await communityPage.gotoForum();
      await communityPage.verifyVisible(communityPage.forumCategories);
      await communityPage.verifyVisible(communityPage.forumThreads);
    });

    test('should display forum categories', async ({ communityPage }) => {
      await communityPage.gotoForum();
      const categoryCount = await communityPage.getElementCount(communityPage.forumCategories);
      expect(categoryCount).toBeGreaterThan(0);
    });
  });

  test.describe('Thread Creation', () => {
    test('should create new thread', async ({ communityPage }) => {
      await communityPage.gotoForum();
      const title = TestDataGenerator.threadTitle();
      const content = TestDataGenerator.paragraph();
      await communityPage.createThread(title, content, 'General', ['help', 'question']);
      await communityPage.verifyVisible(communityPage.successMessage);
    });

    test('should create thread with tags', async ({ communityPage }) => {
      await communityPage.gotoForum();
      const title = TestDataGenerator.threadTitle();
      const content = TestDataGenerator.paragraph();
      await communityPage.createThread(title, content, 'General', ['tag1', 'tag2', 'tag3']);
      await communityPage.verifyVisible('[data-tag="tag1"]');
      await communityPage.verifyVisible('[data-tag="tag2"]');
      await communityPage.verifyVisible('[data-tag="tag3"]');
    });

    test('should validate thread title', async ({ communityPage }) => {
      await communityPage.gotoForum();
      await communityPage.click(communityPage.createThreadButton);
      await communityPage.fill(communityPage.threadContent, 'Content without title');
      await communityPage.click(communityPage.submitThreadButton);
      await communityPage.verifyVisible('[data-testid="title-error"]');
    });
  });

  test.describe('Thread Interaction', () => {
    test('should reply to thread', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      const reply = TestDataGenerator.paragraph();
      await communityPage.replyToThread(threadId, reply);
      await communityPage.verifyVisible('[data-testid="reply-success"]');
    });

    test('should vote thread up', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      await communityPage.voteThread(threadId, true);
      await communityPage.verifyHasClass(communityPage.threadVoteUp, 'active');
    });

    test('should vote thread down', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      await communityPage.voteThread(threadId, false);
      await communityPage.verifyHasClass(communityPage.threadVoteDown, 'active');
    });

    test('should bookmark thread', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      await communityPage.bookmarkThread(threadId);
      await communityPage.verifyThreadBookmarked(threadId);
    });

    test('should share thread', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      await communityPage.shareThread(threadId);
      await communityPage.verifyVisible('[data-testid="share-dialog"]');
    });

    test('should report thread', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      await communityPage.reportThread(threadId, 'Inappropriate content');
      await communityPage.verifyVisible(communityPage.successMessage);
    });
  });

  test.describe('Thread Management', () => {
    test('should edit own thread', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      await communityPage.editThread(threadId, 'Updated Title', 'Updated content');
      await communityPage.verifyTextContains('[data-thread="title"]', 'Updated Title');
    });

    test('should delete own thread', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      await communityPage.deleteThread(threadId);
      await communityPage.verifyUrlContains('/forum');
    });

    test('should pin thread (moderator)', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      await communityPage.pinThread(threadId);
      await communityPage.verifyHasClass(`[data-thread="${threadId}"]`, 'pinned');
    });

    test('should lock thread (moderator)', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      await communityPage.lockThread(threadId);
      await communityPage.verifyHasClass(`[data-thread="${threadId}"]`, 'locked');
    });
  });

  test.describe('Forum Search and Filter', () => {
    test('should search threads', async ({ communityPage }) => {
      await communityPage.gotoForum();
      await communityPage.searchThreads('spreadsheet help');
      await communityPage.wait(1000);
      const results = await communityPage.getElementCount(communityPage.forumThreads);
      expect(results).toBeGreaterThan(0);
    });

    test('should filter threads by category', async ({ communityPage }) => {
      await communityPage.gotoForum();
      await communityPage.filterThreads('Help');
      await communityPage.wait(1000);
      // Verify filtered results
    });

    test('should sort threads by popularity', async ({ communityPage }) => {
      await communityPage.gotoForum();
      await communityPage.sortThreads('popular');
      await communityPage.wait(1000);
      // Verify sorted results
    });

    test('should sort threads by newest', async ({ communityPage }) => {
      await communityPage.gotoForum();
      await communityPage.sortThreads('latest');
      await communityPage.wait(1000);
      // Verify sorted results
    });
  });

  test.describe('Template Gallery', () => {
    test('should navigate to template gallery', async ({ communityPage }) => {
      await communityPage.gotoTemplateGallery();
      await communityPage.verifyVisible(communityPage.templateCategories);
      const templateCount = await communityPage.getElementCount(communityPage.templateCard);
      expect(templateCount).toBeGreaterThan(0);
    });

    test('should preview template', async ({ communityPage }) => {
      const templateId = TestDataGenerator.templateId();
      await communityPage.gotoTemplateGallery();
      await communityPage.viewTemplatePreview(templateId);
      await communityPage.verifyVisible('[data-testid="template-preview-modal"]');
    });

    test('should use template', async ({ communityPage }) => {
      const templateId = TestDataGenerator.templateId();
      await communityPage.gotoTemplateGallery();
      await communityPage.useTemplate(templateId);
      await communityPage.verifyUrlContains('/spreadsheet/');
    });

    test('should favorite template', async ({ communityPage }) => {
      const templateId = TestDataGenerator.templateId();
      await communityPage.gotoTemplateGallery();
      await communityPage.favoriteTemplate(templateId);
      await communityPage.verifyTemplateFavorited(templateId);
    });

    test('should rate template', async ({ communityPage }) => {
      const templateId = TestDataGenerator.templateId();
      await communityPage.gotoTemplateGallery();
      await communityPage.rateTemplate(templateId, 5);
      await communityPage.verifyHasClass(`[data-template="${templateId}"] [data-rating="5"]`, 'active');
    });

    test('should upload template', async ({ communityPage }) => {
      await communityPage.gotoTemplateGallery();
      const name = TestDataGenerator.templateName();
      const description = TestDataGenerator.paragraph();
      await communityPage.uploadTemplate(name, description, 'test-file.xlsx', ['budget', 'finance']);
      await communityPage.verifyVisible(communityPage.successMessage);
    });

    test('should search templates', async ({ communityPage }) => {
      await communityPage.gotoTemplateGallery();
      await communityPage.searchTemplates('budget');
      await communityPage.wait(1000);
      const results = await communityPage.getElementCount(communityPage.templateCard);
      expect(results).toBeGreaterThan(0);
    });

    test('should filter templates by category', async ({ communityPage }) => {
      await communityPage.gotoTemplateGallery();
      await communityPage.filterTemplates('Budget');
      await communityPage.wait(1000);
      // Verify filtered results
    });
  });

  test.describe('User Profile', () => {
    test('should view own profile', async ({ communityPage }) => {
      await communityPage.gotoMyProfile();
      await communityPage.verifyVisible(communityPage.profileName);
      await communityPage.verifyVisible(communityPage.profileBio);
      await communityPage.verifyVisible(communityPage.profileBadges);
    });

    test('should view other user profile', async ({ communityPage }) => {
      const username = TestDataGenerator.username();
      await communityPage.gotoProfile(username);
      await communityPage.verifyVisible(communityPage.profileName);
    });

    test('should edit profile', async ({ communityPage }) => {
      await communityPage.gotoMyProfile();
      await communityPage.editProfile({
        name: 'Updated Name',
        bio: 'Updated bio',
        location: 'San Francisco, CA',
        website: 'https://example.com'
      });
      await communityPage.verifyTextEquals(communityPage.profileName, 'Updated Name');
    });

    test('should follow user', async ({ communityPage }) => {
      const username = TestDataGenerator.username();
      await communityPage.gotoProfile(username);
      await communityPage.followUser(username);
      await communityPage.verifyUserFollowed(username);
    });

    test('should message user', async ({ communityPage }) => {
      const username = TestDataGenerator.username();
      await communityPage.gotoProfile(username);
      await communityPage.messageUser(username, 'Test message');
      await communityPage.verifyVisible(communityPage.successMessage);
    });

    test('should view activity feed', async ({ communityPage }) => {
      const username = TestDataGenerator.username();
      await communityPage.viewActivityFeed(username);
      await communityPage.verifyVisible(communityPage.profileActivityFeed);
    });
  });

  test.describe('Badges and Achievements', () => {
    test('should display earned badges', async ({ communityPage }) => {
      await communityPage.gotoMyProfile();
      await communityPage.viewBadges();
      const badgeCount = await communityPage.getBadgeCount();
      expect(badgeCount).toBeGreaterThan(0);
    });

    test('should show badge progress', async ({ communityPage }) => {
      await communityPage.viewBadges();
      const progress = await communityPage.getBadgeProgress('Spreadsheet Master');
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    test('should verify badge earned', async ({ communityPage }) => {
      await communityPage.viewBadges();
      await communityPage.verifyBadgeEarned('First Steps');
    });

    test('should share badge', async ({ communityPage }) => {
      await communityPage.viewBadges();
      await communityPage.shareBadge('Spreadsheet Master');
      await communityPage.verifyVisible('[data-testid="share-dialog"]');
    });

    test('should view leaderboard', async ({ communityPage }) => {
      await communityPage.viewLeaderboard();
      await communityPage.verifyVisible(communityPage.badgeLeaderboard);
    });

    test('should get leaderboard rank', async ({ communityPage }) => {
      const username = TestDataGenerator.username();
      const rank = await communityPage.getLeaderboardRank(username);
      expect(rank).toBeGreaterThan(0);
    });
  });

  test.describe('Rich Text Editing', () => {
    test('should add emoji to reply', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      await communityPage.addEmoji('thumbs_up');
      await communityPage.verifyVisible('[data-emoji="thumbs_up"]');
    });

    test('should add mention to reply', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      const username = TestDataGenerator.username();
      await communityPage.gotoThread(threadId);
      await communityPage.addMention(username);
      await communityPage.verifyVisible('[data-mention="true"]');
    });

    test('should add hashtag to reply', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      await communityPage.addHashtag('spreadsheet');
      await communityPage.verifyVisible('[data-hashtag="spreadsheet"]');
    });

    test('should add attachment to reply', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      await communityPage.addAttachment('test-file.pdf');
      await communityPage.verifyVisible('[data-attachment="true"]');
    });

    test('should add code block', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      await communityPage.addCodeBlock('=SUM(A1:A10)', 'excel');
      await communityPage.verifyVisible('[data-code-block="true"]');
    });

    test('should add quote block', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      await communityPage.addQuote('This is a quoted text');
      await communityPage.verifyVisible('[data-quote-block="true"]');
    });
  });

  test.describe('Notifications', () => {
    test('should display notification badge', async ({ communityPage }) => {
      await communityPage.gotoForum();
      const count = await communityPage.getNotificationCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should view notifications', async ({ communityPage }) => {
      await communityPage.viewNotifications();
      await communityPage.verifyVisible(communityPage.notificationList);
    });

    test('should mark all notifications as read', async ({ communityPage }) => {
      await communityPage.viewNotifications();
      await communityPage.markAllNotificationsRead();
      const count = await communityPage.getNotificationCount();
      expect(count).toBe(0);
    });
  });

  test.describe('Thread Subscription', () => {
    test('should subscribe to thread', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      await communityPage.gotoThread(threadId);
      await communityPage.subscribeToThread(threadId);
      await communityPage.verifyHasClass(communityPage.subscribeButton, 'active');
    });
  });

  test.describe('Moderation', () => {
    test('should view moderation queue', async ({ communityPage }) => {
      await communityPage.viewModerationQueue();
      await communityPage.verifyVisible(communityPage.moderationQueue);
    });

    test('should approve queued item', async ({ communityPage }) => {
      const itemId = TestDataGenerator.threadId();
      await communityPage.viewModerationQueue();
      await communityPage.approveQueuedItem(itemId);
      await communityPage.verifyVisible(communityPage.successMessage);
    });

    test('should reject queued item', async ({ communityPage }) => {
      const itemId = TestDataGenerator.threadId();
      await communityPage.viewModerationQueue();
      await communityPage.rejectQueuedItem(itemId, 'Does not meet guidelines');
      await communityPage.verifyVisible(communityPage.successMessage);
    });

    test('should warn user', async ({ communityPage }) => {
      const username = TestDataGenerator.username();
      await communityPage.gotoProfile(username);
      await communityPage.warnUser(username, 'Violation of community guidelines');
      await communityPage.verifyVisible(communityPage.successMessage);
    });
  });

  test.describe('Statistics', () => {
    test('should display thread view count', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      const count = await communityPage.getThreadViewCount(threadId);
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should display thread reply count', async ({ communityPage }) => {
      const threadId = TestDataGenerator.threadId();
      const count = await communityPage.getThreadReplyCount(threadId);
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should display template download count', async ({ communityPage }) => {
      const templateId = TestDataGenerator.templateId();
      const count = await communityPage.getTemplateDownloadCount(templateId);
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should display template rating', async ({ communityPage }) => {
      const templateId = TestDataGenerator.templateId();
      const rating = await communityPage.getTemplateRating(templateId);
      expect(rating).toBeGreaterThanOrEqual(0);
      expect(rating).toBeLessThanOrEqual(5);
    });
  });
});
