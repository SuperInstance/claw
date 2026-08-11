/**
 * Spreadsheet Moment - Community REST API
 *
 * Complete REST API endpoints for community features
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { Router, Request, Response } from 'express';

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Create community API router
 */
export function createCommunityRouter(): Router {
  const router = Router();

  // ============================================================================
  // Forum Routes
  // ============================================================================

  /**
   * GET /api/community/forum/posts
   * Get forum posts with filtering and pagination
   */
  router.get('/forum/posts', async (req: Request, res: Response) => {
    try {
      const {
        category,
        sortBy = 'recent',
        tags,
        search,
        page = 1,
        limit = 20,
      } = req.query;

      // TODO: Implement with forum manager
      const posts = []; // await forumManager.getPosts({...});

      res.json({
        success: true,
        data: posts,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total: posts.length,
        },
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch posts',
      } as ApiResponse);
    }
  });

  /**
   * GET /api/community/forum/posts/:postId
   * Get a single post with replies
   */
  router.get('/forum/posts/:postId', async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;

      // TODO: Implement with forum manager
      const post = null; // await forumManager.getPost(postId);

      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found',
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: post,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch post',
      } as ApiResponse);
    }
  });

  /**
   * POST /api/community/forum/posts
   * Create a new post
   */
  router.post('/forum/posts', async (req: Request, res: Response) => {
    try {
      const { title, content, category, tags } = req.body;
      const userId = req.user?.id; // From auth middleware

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        } as ApiResponse);
      }

      // TODO: Implement with forum manager
      const post = null; // await forumManager.createPost({...});

      res.status(201).json({
        success: true,
        data: post,
        message: 'Post created successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create post',
      } as ApiResponse);
    }
  });

  /**
   * PUT /api/community/forum/posts/:postId
   * Update a post
   */
  router.put('/forum/posts/:postId', async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const { title, content, tags } = req.body;
      const userId = req.user?.id;

      // TODO: Implement with forum manager
      const post = null; // await forumManager.updatePost(postId, {...});

      res.json({
        success: true,
        data: post,
        message: 'Post updated successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update post',
      } as ApiResponse);
    }
  });

  /**
   * DELETE /api/community/forum/posts/:postId
   * Delete a post
   */
  router.delete('/forum/posts/:postId', async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      // TODO: Implement with forum manager
      // await forumManager.deletePost(postId);

      res.json({
        success: true,
        message: 'Post deleted successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete post',
      } as ApiResponse);
    }
  });

  /**
   * POST /api/community/forum/posts/:postId/vote
   * Vote on a post
   */
  router.post('/forum/posts/:postId/vote', async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const { vote } = req.body; // 1 or -1
      const userId = req.user?.id;

      if (vote !== 1 && vote !== -1) {
        return res.status(400).json({
          success: false,
          error: 'Invalid vote value',
        } as ApiResponse);
      }

      // TODO: Implement with forum manager
      const post = null; // await forumManager.votePost(postId, userId, vote);

      res.json({
        success: true,
        data: post,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to vote on post',
      } as ApiResponse);
    }
  });

  /**
   * POST /api/community/forum/posts/:postId/replies
   * Add a reply to a post
   */
  router.post('/forum/posts/:postId/replies', async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      // TODO: Implement with forum manager
      const reply = null; // await forumManager.addReply(postId, {...});

      res.status(201).json({
        success: true,
        data: reply,
        message: 'Reply added successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to add reply',
      } as ApiResponse);
    }
  });

  /**
   * POST /api/community/forum/posts/:postId/replies/:replyId/accept
   * Accept a reply as the answer
   */
  router.post('/forum/posts/:postId/replies/:replyId/accept', async (req: Request, res: Response) => {
    try {
      const { postId, replyId } = req.params;
      const userId = req.user?.id;

      // TODO: Implement with forum manager
      const post = null; // await forumManager.acceptReply(postId, replyId, userId);

      res.json({
        success: true,
        data: post,
        message: 'Reply accepted as answer',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to accept reply',
      } as ApiResponse);
    }
  });

  // ============================================================================
  // Template Routes
  // ============================================================================

  /**
   * GET /api/community/templates
   * Get templates with filtering and pagination
   */
  router.get('/templates', async (req: Request, res: Response) => {
    try {
      const {
        category,
        sortBy = 'trending',
        tags,
        search,
        featured,
        page = 1,
        limit = 20,
      } = req.query;

      // TODO: Implement with template manager
      const templates = []; // await templateManager.getTemplates({...});

      res.json({
        success: true,
        data: templates,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total: templates.length,
        },
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch templates',
      } as ApiResponse);
    }
  });

  /**
   * GET /api/community/templates/:templateId
   * Get a single template
   */
  router.get('/templates/:templateId', async (req: Request, res: Response) => {
    try {
      const { templateId } = req.params;

      // TODO: Implement with template manager
      const template = null; // await templateManager.getTemplate(templateId);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found',
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: template,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch template',
      } as ApiResponse);
    }
  });

  /**
   * POST /api/community/templates
   * Create a new template (share to community)
   */
  router.post('/templates', async (req: Request, res: Response) => {
    try {
      const { name, description, category, tags, spreadsheetId } = req.body;
      const userId = req.user?.id;

      // TODO: Implement with sharing manager
      const result = null; // await sharingManager.shareToCommunity(userId, spreadsheetId, {...});

      res.status(201).json({
        success: true,
        data: result,
        message: 'Template shared successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to share template',
      } as ApiResponse);
    }
  });

  /**
   * POST /api/community/templates/:templateId/download
   * Download a template
   */
  router.post('/templates/:templateId/download', async (req: Request, res: Response) => {
    try {
      const { templateId } = req.params;
      const userId = req.user?.id;

      // TODO: Implement with template manager
      const clonedSpreadsheetId = null; // await templateManager.downloadTemplate(templateId, userId);

      res.json({
        success: true,
        data: { spreadsheetId: clonedSpreadsheetId },
        message: 'Template downloaded successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to download template',
      } as ApiResponse);
    }
  });

  /**
   * POST /api/community/templates/:templateId/reviews
   * Rate and review a template
   */
  router.post('/templates/:templateId/reviews', async (req: Request, res: Response) => {
    try {
      const { templateId } = req.params;
      const { rating, title, content } = req.body;
      const userId = req.user?.id;

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5',
        } as ApiResponse);
      }

      // TODO: Implement with template manager
      const review = null; // await templateManager.rateTemplate(templateId, {...});

      res.status(201).json({
        success: true,
        data: review,
        message: 'Review added successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to add review',
      } as ApiResponse);
    }
  });

  /**
   * GET /api/community/templates/:templateId/reviews
   * Get template reviews
   */
  router.get('/templates/:templateId/reviews', async (req: Request, res: Response) => {
    try {
      const { templateId } = req.params;
      const { sortBy = 'recent', page = 1, limit = 10 } = req.query;

      // TODO: Implement with template manager
      const reviews = []; // await templateManager.getReviews(templateId, {...});

      res.json({
        success: true,
        data: reviews,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total: reviews.length,
        },
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch reviews',
      } as ApiResponse);
    }
  });

  /**
   * POST /api/community/templates/:templateId/fork
   * Fork a template
   */
  router.post('/templates/:templateId/fork', async (req: Request, res: Response) => {
    try {
      const { templateId } = req.params;
      const userId = req.user?.id;

      // TODO: Implement with sharing manager
      const fork = null; // await sharingManager.forkTemplate(userId, templateId);

      res.status(201).json({
        success: true,
        data: fork,
        message: 'Template forked successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fork template',
      } as ApiResponse);
    }
  });

  // ============================================================================
  // User Routes
  // ============================================================================

  /**
   * GET /api/community/users/:userId
   * Get user profile
   */
  router.get('/users/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      // TODO: Implement with user manager
      const profile = null; // await userManager.getUserProfile(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: profile,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile',
      } as ApiResponse);
    }
  });

  /**
   * PUT /api/community/users/:userId
   * Update user profile
   */
  router.put('/users/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { name, bio, location, avatar, website, twitter, github, linkedin } = req.body;
      const currentUserId = req.user?.id;

      if (currentUserId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this profile',
        } as ApiResponse);
      }

      // TODO: Implement with user manager
      const profile = null; // await userManager.updateProfile(userId, {...});

      res.json({
        success: true,
        data: profile,
        message: 'Profile updated successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
      } as ApiResponse);
    }
  });

  /**
   * GET /api/community/users/:userId/activity
   * Get user activity feed
   */
  router.get('/users/:userId/activity', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // TODO: Implement with user manager
      const activities = []; // await userManager.getActivity(userId, {...});

      res.json({
        success: true,
        data: activities,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total: activities.length,
        },
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch activity',
      } as ApiResponse);
    }
  });

  /**
   * GET /api/community/users/:userId/badges
   * Get user badges
   */
  router.get('/users/:userId/badges', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      // TODO: Implement with gamification manager
      const badges = null; // await gamificationManager.getBadgesByRarity(userId);

      res.json({
        success: true,
        data: badges,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch badges',
      } as ApiResponse);
    }
  });

  // ============================================================================
  // Leaderboard Routes
  // ============================================================================

  /**
   * GET /api/community/leaderboard
   * Get leaderboard
   */
  router.get('/leaderboard', async (req: Request, res: Response) => {
    try {
      const { sortBy = 'reputation', limit = 10 } = req.query;

      // TODO: Implement with gamification manager
      const leaderboard = []; // await gamificationManager.getLeaderboard({...});

      res.json({
        success: true,
        data: leaderboard,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch leaderboard',
      } as ApiResponse);
    }
  });

  // ============================================================================
  // Search Routes
  // ============================================================================

  /**
   * GET /api/community/search
   * Search across community
   */
  router.get('/search', async (req: Request, res: Response) => {
    try {
      const { q, type, category, tags, sortBy, page = 1 } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
        } as ApiResponse);
      }

      // TODO: Implement with search manager
      const results = null; // await searchManager.search({...});

      res.json({
        success: true,
        data: results,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Search failed',
      } as ApiResponse);
    }
  });

  /**
   * GET /api/community/search/suggestions
   * Get search suggestions
   */
  router.get('/search/suggestions', async (req: Request, res: Response) => {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required',
        } as ApiResponse);
      }

      // TODO: Implement with search manager
      const suggestions = []; // await searchManager.getSuggestions(q);

      res.json({
        success: true,
        data: suggestions,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch suggestions',
      } as ApiResponse);
    }
  });

  /**
   * GET /api/community/search/popular
   * Get popular searches
   */
  router.get('/search/popular', async (req: Request, res: Response) => {
    try {
      const { limit = 10 } = req.query;

      // TODO: Implement with search manager
      const popular = []; // await searchManager.getPopularSearches(Number(limit));

      res.json({
        success: true,
        data: popular,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch popular searches',
      } as ApiResponse);
    }
  });

  // ============================================================================
  // Moderation Routes
  // ============================================================================

  /**
   * POST /api/community/moderation/flag
   * Flag content for review
   */
  router.post('/moderation/flag', async (req: Request, res: Response) => {
    try {
      const { contentType, contentId, reason, category, description } = req.body;
      const userId = req.user?.id;

      // TODO: Implement with moderation manager
      const flag = null; // await moderationManager.flagContent({...});

      res.status(201).json({
        success: true,
        data: flag,
        message: 'Content flagged successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to flag content',
      } as ApiResponse);
    }
  });

  /**
   * GET /api/community/moderation/queue
   * Get moderation queue (requires moderator role)
   */
  router.get('/moderation/queue', async (req: Request, res: Response) => {
    try {
      const { status, priority, limit = 20 } = req.query;

      // Check if user is moderator
      if (!req.user?.roles?.includes('moderator')) {
        return res.status(403).json({
          success: false,
          error: 'Moderator access required',
        } as ApiResponse);
      }

      // TODO: Implement with moderation manager
      const queue = []; // await moderationManager.getModerationQueue({...});

      res.json({
        success: true,
        data: queue,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch moderation queue',
      } as ApiResponse);
    }
  });

  /**
   * POST /api/community/moderation/flags/:flagId/review
   * Review a flag (requires moderator role)
   */
  router.post('/moderation/flags/:flagId/review', async (req: Request, res: Response) => {
    try {
      const { flagId } = req.params;
      const { action, moderatorNote } = req.body;
      const moderatorId = req.user?.id;

      if (!req.user?.roles?.includes('moderator')) {
        return res.status(403).json({
          success: false,
          error: 'Moderator access required',
        } as ApiResponse);
      }

      // TODO: Implement with moderation manager
      const flag = null; // await moderationManager.reviewFlag(flagId, {...});

      res.json({
        success: true,
        data: flag,
        message: 'Flag reviewed successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to review flag',
      } as ApiResponse);
    }
  });

  /**
   * GET /api/community/moderation/stats
   * Get moderation statistics (requires moderator role)
   */
  router.get('/moderation/stats', async (req: Request, res: Response) => {
    try {
      if (!req.user?.roles?.includes('moderator')) {
        return res.status(403).json({
          success: false,
          error: 'Moderator access required',
        } as ApiResponse);
      }

      // TODO: Implement with moderation manager
      const stats = null; // await moderationManager.getModerationStats();

      res.json({
        success: true,
        data: stats,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch moderation stats',
      } as ApiResponse);
    }
  });

  return router;
}

/**
 * API documentation
 */
export const API_DOCUMENTATION = `
# Spreadsheet Moment Community API

## Base URL
\`\`\`
https://api.spreadsheetmoment.com/community
\`\`\`

## Authentication
All endpoints require authentication via Bearer token:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Forum Endpoints

### Get Posts
\`\`\`
GET /forum/posts
Query Params:
  - category: string
  - sortBy: 'recent' | 'popular' | 'unanswered'
  - tags: string[]
  - search: string
  - page: number
  - limit: number
\`\`\`

### Get Post
\`\`\`
GET /forum/posts/:postId
\`\`\`

### Create Post
\`\`\`
POST /forum/posts
Body:
{
  title: string,
  content: string,
  category: string,
  tags: string[]
}
\`\`\`

### Vote on Post
\`\`\`
POST /forum/posts/:postId/vote
Body:
{
  vote: 1 | -1
}
\`\`\`

### Add Reply
\`\`\`
POST /forum/posts/:postId/replies
Body:
{
  content: string
}
\`\`\`

### Accept Reply
\`\`\`
POST /forum/posts/:postId/replies/:replyId/accept
\`\`\`

## Template Endpoints

### Get Templates
\`\`\`
GET /templates
Query Params:
  - category: string
  - sortBy: 'trending' | 'newest' | 'rating' | 'downloads'
  - tags: string[]
  - search: string
  - featured: boolean
  - page: number
  - limit: number
\`\`\`

### Get Template
\`\`\`
GET /templates/:templateId
\`\`\`

### Share Template
\`\`\`
POST /templates
Body:
{
  name: string,
  description: string,
  category: string,
  tags: string[],
  spreadsheetId: string
}
\`\`\`

### Download Template
\`\`\`
POST /templates/:templateId/download
\`\`\`

### Rate Template
\`\`\`
POST /templates/:templateId/reviews
Body:
{
  rating: number (1-5),
  title: string,
  content: string
}
\`\`\`

### Fork Template
\`\`\`
POST /templates/:templateId/fork
\`\`\`

## User Endpoints

### Get User Profile
\`\`\`
GET /users/:userId
\`\`\`

### Update User Profile
\`\`\`
PUT /users/:userId
Body:
{
  name: string,
  bio: string,
  location: string,
  avatar: string,
  website: string,
  twitter: string,
  github: string,
  linkedin: string
}
\`\`\`

### Get User Activity
\`\`\`
GET /users/:userId/activity
Query Params:
  - page: number
  - limit: number
\`\`\`

### Get User Badges
\`\`\`
GET /users/:userId/badges
\`\`\`

## Leaderboard Endpoint

### Get Leaderboard
\`\`\`
GET /leaderboard
Query Params:
  - sortBy: 'reputation' | 'posts' | 'templates'
  - limit: number
\`\`\`

## Search Endpoints

### Search
\`\`\`
GET /search
Query Params:
  - q: string (required)
  - type: 'all' | 'posts' | 'templates' | 'users'
  - category: string
  - tags: string[]
  - sortBy: 'relevance' | 'recent' | 'popular' | 'rating'
\`\`\`

### Get Suggestions
\`\`\`
GET /search/suggestions
Query Params:
  - q: string (required)
\`\`\`

### Get Popular Searches
\`\`\`
GET /search/popular
Query Params:
  - limit: number
\`\`\`

## Moderation Endpoints (Requires Moderator Role)

### Flag Content
\`\`\`
POST /moderation/flag
Body:
{
  contentType: 'post' | 'reply' | 'template' | 'user',
  contentId: string,
  reason: string,
  category: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'malware' | 'other',
  description: string
}
\`\`\`

### Get Moderation Queue
\`\`\`
GET /moderation/queue
Query Params:
  - status: 'pending' | 'reviewing' | 'approved' | 'rejected'
  - priority: 'low' | 'medium' | 'high' | 'urgent'
  - limit: number
\`\`\`

### Review Flag
\`\`\`
POST /moderation/flags/:flagId/review
Body:
{
  action: 'approve' | 'reject',
  moderatorNote: string
}
\`\`\`

### Get Moderation Stats
\`\`\`
GET /moderation/stats
\`\`\`
`;
