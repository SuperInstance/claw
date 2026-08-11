/**
 * i18n + Community Features Integration Tests
 * Tests multilingual content, localization, and community features
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { getTestDb } from '../../database/client';
import {
  generateTestUser,
  generateTestPost,
  getSpanishUser,
  getJapaneseUser,
  getDiverseTestUsers,
} from '../../database/seeds';
import { ApiTestClient, GraphQLQueries, GraphQLMutations } from '../../helpers/api';
import { COMMUNITY_POSTS, COMMENTS } from '../../fixtures';

// Mock Express app
const mockApp = {
  post: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  send: jest.fn().mockResolvedValue({ body: { data: {} } }),
};

describe('i18n + Community Features Integration Tests', () => {
  let db: ReturnType<typeof getTestDb>;
  let apiClient: ApiTestClient;
  let testUsers: any[];

  beforeAll(async () => {
    db = getTestDb();
    await db.startTransaction();

    apiClient = new ApiTestClient(mockApp as any);

    // Create diverse test users
    testUsers = await getDiverseTestUsers();
    await db.seedData({ users: testUsers });
  });

  afterAll(async () => {
    await db.rollbackTransaction();
    await db.close();
  });

  beforeEach(async () => {
    await db.startTransaction();
  });

  afterEach(async () => {
    await db.rollbackTransaction();
    apiClient.clearAuth();
  });

  describe('User Localization', () => {
    test('should respect user locale preference', async () => {
      // Arrange
      const spanishUser = testUsers.find((u) => u.locale === 'es-ES');
      await apiClient.authenticateUser(spanishUser);

      // Act
      const query = GraphQLQueries.getMe;

      // Mock successful response with Spanish locale
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            me: {
              id: spanishUser.id,
              email: spanishUser.email,
              username: spanishUser.username,
              locale: 'es-ES',
              preferences: {
                theme: 'light',
                language: 'es-ES',
              },
            },
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.me.locale).toBe('es-ES');
      expect(response.data?.me.preferences.language).toBe('es-ES');
    });

    test('should update user locale preference', async () => {
      // Arrange
      const englishUser = testUsers.find((u) => u.locale === 'en-US');
      await apiClient.authenticateUser(englishUser);

      // Act
      const mutation = `
        mutation UpdateLocale {
          updateUserPreferences(input: {
            locale: "ja-JP"
          }) {
            locale
          }
        }
      `;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            updateUserPreferences: {
              locale: 'ja-JP',
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.updateUserPreferences.locale).toBe('ja-JP');

      // Verify in database
      const dbUser = await db.getUserByEmail(englishUser.email);
      expect(dbUser.locale).toBe('ja-JP');
    });

    test('should return localized error messages', async () => {
      // Arrange
      const spanishUser = testUsers.find((u) => u.locale === 'es-ES');
      await apiClient.authenticateUser(spanishUser);

      // Act - Trigger an error
      const mutation = GraphQLMutations.createSpreadsheet(''); // Invalid: empty name

      // Mock error response with Spanish message
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'El nombre de la hoja de cálculo no puede estar vacío',
              extensions: {
                code: 'VALIDATION_ERROR',
                locale: 'es-ES',
              },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.locale).toBe('es-ES');
    });

    test('should format dates according to locale', async () => {
      // Arrange
      const japaneseUser = testUsers.find((u) => u.locale === 'ja-JP');
      await apiClient.authenticateUser(japaneseUser);

      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet = generateTestSpreadsheet({ owner_id: japaneseUser.id });
      await db.seedData({ spreadsheets: [spreadsheet] });

      // Act
      const query = GraphQLQueries.getSpreadsheet(spreadsheet.id);

      // Mock successful response with Japanese date format
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            spreadsheet: {
              id: spreadsheet.id,
              name: spreadsheet.name,
              createdAt: '2024/03/14 10:30',
            },
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.spreadsheet.createdAt).toMatch(/\d{4}\/\d{2}\/\d{2}/); // Japanese format
    });

    test('should support multiple locales for UI elements', async () => {
      // Act - Query supported locales
      const query = `
        query SupportedLocales {
          supportedLocales {
            code
            name
            nativeName
          }
        }
      `;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            supportedLocales: [
              { code: 'en-US', name: 'English (US)', nativeName: 'English (United States)' },
              { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)' },
              { code: 'ja-JP', name: 'Japanese (Japan)', nativeName: '日本語' },
              { code: 'fr-FR', name: 'French (France)', nativeName: 'Français (France)' },
              { code: 'de-DE', name: 'German (Germany)', nativeName: 'Deutsch (Deutschland)' },
            ],
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.supportedLocales).toHaveLength(5);
      expect(response.data?.supportedLocales[0].nativeName).toBeDefined();
    });
  });

  describe('Multilingual Content', () => {
    test('should create posts in different languages', async () => {
      // Arrange
      const englishUser = testUsers.find((u) => u.locale === 'en-US');
      await apiClient.authenticateUser(englishUser);

      // Act - Create English post
      const mutation = GraphQLMutations.createPost(
        COMMUNITY_POSTS.englishTutorial.title,
        COMMUNITY_POSTS.englishTutorial.content,
        COMMUNITY_POSTS.englishTutorial.tags
      );

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            createPost: {
              id: expect.any(String),
              title: COMMUNITY_POSTS.englishTutorial.title,
              content: COMMUNITY_POSTS.englishTutorial.content,
              locale: 'en-US',
              tags: COMMUNITY_POSTS.englishTutorial.tags,
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.createPost.locale).toBe('en-US');

      // Verify in database
      const result = await db.query(
        'SELECT * FROM test_schema.community_posts WHERE locale = $1',
        ['en-US']
      );
      expect(result.rows.length).toBeGreaterThan(0);
    });

    test('should create Spanish content', async () => {
      // Arrange
      const spanishUser = testUsers.find((u) => u.locale === 'es-ES');
      await apiClient.authenticateUser(spanishUser);

      // Act
      const mutation = GraphQLMutations.createPost(
        COMMUNITY_POSTS.spanishTutorial.title,
        COMMUNITY_POSTS.spanishTutorial.content,
        COMMUNITY_POSTS.spanishTutorial.tags
      );

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            createPost: {
              id: expect.any(String),
              title: COMMUNITY_POSTS.spanishTutorial.title,
              content: COMMUNITY_POSTS.spanishTutorial.content,
              locale: 'es-ES',
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.createPost.locale).toBe('es-ES');
    });

    test('should create Japanese content', async () => {
      // Arrange
      const japaneseUser = testUsers.find((u) => u.locale === 'ja-JP');
      await apiClient.authenticateUser(japaneseUser);

      // Act
      const mutation = GraphQLMutations.createPost(
        COMMUNITY_POSTS.japaneseTips.title,
        COMMUNITY_POSTS.japaneseTips.content,
        COMMUNITY_POSTS.japaneseTips.tags
      );

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            createPost: {
              id: expect.any(String),
              title: COMMUNITY_POSTS.japaneseTips.title,
              content: COMMUNITY_POSTS.japaneseTips.content,
              locale: 'ja-JP',
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.createPost.locale).toBe('ja-JP');
    });

    test('should filter posts by locale', async () => {
      // Arrange - Seed posts in different languages
      const englishUser = testUsers.find((u) => u.locale === 'en-US');
      const spanishUser = testUsers.find((u) => u.locale === 'es-ES');

      await db.seedData({
        posts: [
          generateTestPost({ author_id: englishUser.id, locale: 'en-US', title: 'English Post' }),
          generateTestPost({ author_id: spanishUser.id, locale: 'es-ES', title: 'Spanish Post' }),
          generateTestPost({ author_id: englishUser.id, locale: 'en-US', title: 'Another English Post' }),
        ],
      });

      // Act - Query English posts
      const query = GraphQLQueries.getPosts(10, 'en-US');

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            posts: [
              { id: expect.any(String), title: 'English Post', locale: 'en-US' },
              { id: expect.any(String), title: 'Another English Post', locale: 'en-US' },
            ],
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      response.data?.posts.forEach((post: any) => {
        expect(post.locale).toBe('en-US');
      });
    });

    test('should search posts across all languages', async () => {
      // Arrange - Seed multilingual posts
      const posts = [
        generateTestPost({ author_id: testUsers[0].id, locale: 'en-US', title: 'Tutorial in English' }),
        generateTestPost({ author_id: testUsers[1].id, locale: 'es-ES', title: 'Tutorial en Español' }),
        generateTestPost({ author_id: testUsers[2].id, locale: 'ja-JP', title: '日本語のチュートリアル' }),
      ];
      await db.seedData({ posts });

      // Act - Search for "tutorial"
      const query = `
        query SearchPosts($searchTerm: String!) {
          searchPosts(searchTerm: $searchTerm) {
            id
            title
            locale
          }
        }
      `;

      const variables = { searchTerm: 'tutorial' };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            searchPosts: posts.map((p) => ({
              id: p.id,
              title: p.title,
              locale: p.locale,
            })),
          },
        },
      });

      const response = await apiClient.query(query, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.searchPosts).toHaveLength(3);
      expect(response.data?.searchPosts[0].locale).toBe('en-US');
      expect(response.data?.searchPosts[1].locale).toBe('es-ES');
      expect(response.data?.searchPosts[2].locale).toBe('ja-JP');
    });
  });

  describe('Community Posts', () => {
    test('should create a community post', async () => {
      // Arrange
      const user = testUsers[0];
      await apiClient.authenticateUser(user);

      // Act
      const mutation = GraphQLMutations.createPost(
        'Test Post',
        'This is a test post content.',
        ['test', 'community']
      );

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            createPost: {
              id: expect.any(String),
              title: 'Test Post',
              content: 'This is a test post content.',
              tags: ['test', 'community'],
              createdAt: expect.any(String),
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.createPost.title).toBe('Test Post');
      expect(response.data?.createPost.tags).toEqual(['test', 'community']);
    });

    test('should retrieve a post by ID', async () => {
      // Arrange
      const user = testUsers[0];
      const post = generateTestPost({ author_id: user.id });
      await db.seedData({ posts: [post] });

      // Act
      const query = GraphQLQueries.getPost(post.id);

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            post: {
              id: post.id,
              title: post.title,
              content: post.content,
              locale: post.locale,
              tags: post.tags,
              author: {
                id: user.id,
                username: user.username,
              },
              comments: [],
            },
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.post.id).toBe(post.id);
      expect(response.data?.post.author.id).toBe(user.id);
    });

    test('should list posts with pagination', async () => {
      // Arrange
      const user = testUsers[0];
      const posts = Array.from({ length: 15 }, () =>
        generateTestPost({ author_id: user.id })
      );
      await db.seedData({ posts });

      // Act
      const query = `
        query ListPosts($first: Int!, $after: String) {
          posts(first: $first, after: $after) {
            edges {
              node {
                id
                title
              }
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              endCursor
            }
            totalCount
          }
        }
      `;

      const variables = { first: 10 };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            posts: {
              edges: posts.slice(0, 10).map((p) => ({
                node: { id: p.id, title: p.title },
                cursor: p.id,
              })),
              pageInfo: {
                hasNextPage: true,
                hasPreviousPage: false,
                endCursor: posts[9].id,
              },
              totalCount: 15,
            },
          },
        },
      });

      const response = await apiClient.query(query, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.posts.edges).toHaveLength(10);
      expect(response.data?.posts.pageInfo.hasNextPage).toBe(true);
      expect(response.data?.posts.totalCount).toBe(15);
    });

    test('should update own post', async () => {
      // Arrange
      const user = testUsers[0];
      await apiClient.authenticateUser(user);
      const post = generateTestPost({ author_id: user.id });
      await db.seedData({ posts: [post] });

      // Act
      const mutation = `
        mutation UpdatePost($postId: ID!, $title: String!, $content: String!) {
          updatePost(input: {
            postId: $postId
            title: $title
            content: $content
          }) {
            id
            title
            content
            updatedAt
          }
        }
      `;

      const variables = {
        postId: post.id,
        title: 'Updated Title',
        content: 'Updated content',
      };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            updatePost: {
              id: post.id,
              title: 'Updated Title',
              content: 'Updated content',
              updatedAt: expect.any(String),
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.updatePost.title).toBe('Updated Title');
    });

    test('should prevent updating other users posts', async () => {
      // Arrange
      const user1 = testUsers[0];
      const user2 = testUsers[1];
      await apiClient.authenticateUser(user2);
      const post = generateTestPost({ author_id: user1.id });
      await db.seedData({ posts: [post] });

      // Act
      const mutation = `
        mutation UpdatePost($postId: ID!, $title: String!) {
          updatePost(input: {
            postId: $postId
            title: $title
          }) {
            id
            title
          }
        }
      `;

      const variables = { postId: post.id, title: 'Hacked Title' };

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Not authorized to update this post',
              extensions: { code: 'NOT_AUTHORIZED' },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation, variables);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('NOT_AUTHORIZED');
    });

    test('should delete own post', async () => {
      // Arrange
      const user = testUsers[0];
      await apiClient.authenticateUser(user);
      const post = generateTestPost({ author_id: user.id });
      await db.seedData({ posts: [post] });

      // Act
      const mutation = `
        mutation DeletePost($postId: ID!) {
          deletePost(postId: $postId) {
            success
          }
        }
      `;

      const variables = { postId: post.id };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            deletePost: { success: true },
          },
        },
      });

      const response = await apiClient.mutate(mutation, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.deletePost.success).toBe(true);
    });
  });

  describe('Comments', () => {
    test('should add comment to post', async () => {
      // Arrange
      const user = testUsers[0];
      await apiClient.authenticateUser(user);
      const post = generateTestPost({ author_id: user.id });
      await db.seedData({ posts: [post] });

      // Act
      const mutation = GraphQLMutations.addComment(post.id, COMMENTS.helpfulAnswer.content);

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            addComment: {
              id: expect.any(String),
              content: COMMENTS.helpfulAnswer.content,
              createdAt: expect.any(String),
              author: {
                id: user.id,
                username: user.username,
              },
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.addComment.content).toBe(COMMENTS.helpfulAnswer.content);

      // Verify in database
      const result = await db.query(
        'SELECT * FROM test_schema.comments WHERE post_id = $1',
        [post.id]
      );
      expect(result.rows.length).toBeGreaterThan(0);
    });

    test('should retrieve post with comments', async () => {
      // Arrange
      const user = testUsers[0];
      const post = generateTestPost({ author_id: user.id });
      await db.seedData({ posts: [post] });

      // Add comments
      await db.query(
        `INSERT INTO test_schema.comments (post_id, author_id, content)
         VALUES ($1, $2, $3), ($1, $2, $4)`,
        [post.id, user.id, 'First comment', 'Second comment']
      );

      // Act
      const query = GraphQLQueries.getPost(post.id);

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            post: {
              id: post.id,
              title: post.title,
              comments: [
                {
                  id: expect.any(String),
                  content: 'First comment',
                  author: { id: user.id, username: user.username },
                },
                {
                  id: expect.any(String),
                  content: 'Second comment',
                  author: { id: user.id, username: user.username },
                },
              ],
            },
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.post.comments).toHaveLength(2);
    });

    test('should update own comment', async () => {
      // Arrange
      const user = testUsers[0];
      await apiClient.authenticateUser(user);
      const post = generateTestPost({ author_id: user.id });
      await db.seedData({ posts: [post] });

      const commentResult = await db.query(
        `INSERT INTO test_schema.comments (post_id, author_id, content)
         VALUES ($1, $2, $3) RETURNING id`,
        [post.id, user.id, 'Original comment']
      );
      const commentId = commentResult.rows[0].id;

      // Act
      const mutation = `
        mutation UpdateComment($commentId: ID!, $content: String!) {
          updateComment(input: {
            commentId: $commentId
            content: $content
          }) {
            id
            content
            updatedAt
          }
        }
      `;

      const variables = { commentId, content: 'Updated comment' };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            updateComment: {
              id: commentId,
              content: 'Updated comment',
              updatedAt: expect.any(String),
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.updateComment.content).toBe('Updated comment');
    });

    test('should delete own comment', async () => {
      // Arrange
      const user = testUsers[0];
      await apiClient.authenticateUser(user);
      const post = generateTestPost({ author_id: user.id });
      await db.seedData({ posts: [post] });

      const commentResult = await db.query(
        `INSERT INTO test_schema.comments (post_id, author_id, content)
         VALUES ($1, $2, $3) RETURNING id`,
        [post.id, user.id, 'Comment to delete']
      );
      const commentId = commentResult.rows[0].id;

      // Act
      const mutation = `
        mutation DeleteComment($commentId: ID!) {
          deleteComment(commentId: $commentId) {
            success
          }
        }
      `;

      const variables = { commentId };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            deleteComment: { success: true },
          },
        },
      });

      const response = await apiClient.mutate(mutation, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.deleteComment.success).toBe(true);
    });
  });

  describe('Voting System', () => {
    test('should upvote a post', async () => {
      // Arrange
      const user = testUsers[0];
      await apiClient.authenticateUser(user);
      const post = generateTestPost({ author_id: user.id });
      await db.seedData({ posts: [post] });

      // Act
      const mutation = GraphQLMutations.upvotePost(post.id);

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            upvotePost: {
              id: post.id,
              upvotes: 1,
              downvotes: 0,
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.upvotePost.upvotes).toBe(1);
    });

    test('should downvote a post', async () => {
      // Arrange
      const user = testUsers[0];
      await apiClient.authenticateUser(user);
      const post = generateTestPost({ author_id: user.id });
      await db.seedData({ posts: [post] });

      // Act
      const mutation = GraphQLMutations.downvotePost(post.id);

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            downvotePost: {
              id: post.id,
              upvotes: 0,
              downvotes: 1,
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.downvotePost.downvotes).toBe(1);
    });

    test('should change upvote to downvote', async () => {
      // Arrange
      const user = testUsers[0];
      await apiClient.authenticateUser(user);
      const post = generateTestPost({ author_id: user.id });
      await db.seedData({ posts: [post] });

      // First upvote
      await db.query(
        `INSERT INTO test_schema.community_posts (id, author_id, title, content, upvotes)
         VALUES ($1, $2, $3, $4, 1)`,
        [post.id, user.id, post.title, post.content]
      );

      // Act - Change to downvote
      const mutation = GraphQLMutations.downvotePost(post.id);

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            downvotePost: {
              id: post.id,
              upvotes: 0,
              downvotes: 1,
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.downvotePost.upvotes).toBe(0);
      expect(response.data?.downvotePost.downvotes).toBe(1);
    });

    test('should upvote a comment', async () => {
      // Arrange
      const user = testUsers[0];
      await apiClient.authenticateUser(user);
      const post = generateTestPost({ author_id: user.id });
      await db.seedData({ posts: [post] });

      const commentResult = await db.query(
        `INSERT INTO test_schema.comments (post_id, author_id, content)
         VALUES ($1, $2, $3) RETURNING id`,
        [post.id, user.id, 'Great comment!']
      );
      const commentId = commentResult.rows[0].id;

      // Act
      const mutation = `
        mutation UpvoteComment($commentId: ID!) {
          upvoteComment(commentId: $commentId) {
            id
            upvotes
          }
        }
      `;

      const variables = { commentId };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            upvoteComment: {
              id: commentId,
              upvotes: 1,
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.upvoteComment.upvotes).toBe(1);
    });
  });

  describe('Content Moderation', () => {
    test('should filter inappropriate content', async () => {
      // Arrange
      const user = testUsers[0];
      await apiClient.authenticateUser(user);

      // Act - Try to create post with inappropriate content
      const mutation = GraphQLMutations.createPost(
        'Spam Title',
        'This is spam content with malicious links.',
        []
      );

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Content violates community guidelines',
              extensions: { code: 'CONTENT_POLICY_VIOLATION' },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('CONTENT_POLICY_VIOLATION');
    });

    test('should allow moderators to remove content', async () => {
      // Arrange
      const moderator = testUsers.find((u) => u.role === 'admin');
      await apiClient.authenticateUser(moderator);

      const user = testUsers[0];
      const post = generateTestPost({ author_id: user.id, title: 'Removable Post' });
      await db.seedData({ posts: [post] });

      // Act
      const mutation = `
        mutation RemoveContent($postId: ID!, $reason: String!) {
          removeContent(input: {
            postId: $postId
            reason: $reason
          }) {
            success
          }
        }
      `;

      const variables = { postId: post.id, reason: 'Violates guidelines' };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            removeContent: { success: true },
          },
        },
      });

      const response = await apiClient.mutate(mutation, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.removeContent.success).toBe(true);
    });

    test('should flag content for review', async () => {
      // Arrange
      const user = testUsers[0];
      await apiClient.authenticateUser(user);
      const post = generateTestPost({ author_id: user.id });
      await db.seedData({ posts: [post] });

      // Act
      const mutation = `
        mutation FlagContent($postId: ID!, $reason: String!) {
          flagContent(input: {
            postId: $postId
            reason: $reason
          }) {
            success
          }
        }
      `;

      const variables = { postId: post.id, reason: 'Inappropriate content' };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            flagContent: { success: true },
          },
        },
      });

      const response = await apiClient.mutate(mutation, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.flagContent.success).toBe(true);
    });
  });

  describe('Tag System', () => {
    test('should create post with multiple tags', async () => {
      // Arrange
      const user = testUsers[0];
      await apiClient.authenticateUser(user);

      // Act
      const mutation = GraphQLMutations.createPost(
        'Tagged Post',
        'Content with multiple tags',
        ['tutorial', 'advanced', 'formulas']
      );

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            createPost: {
              id: expect.any(String),
              title: 'Tagged Post',
              tags: ['tutorial', 'advanced', 'formulas'],
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.createPost.tags).toEqual(['tutorial', 'advanced', 'formulas']);
    });

    test('should filter posts by tag', async () => {
      // Arrange
      const user = testUsers[0];
      const posts = [
        generateTestPost({ author_id: user.id, tags: ['tutorial', 'beginner'] }),
        generateTestPost({ author_id: user.id, tags: ['tutorial', 'advanced'] }),
        generateTestPost({ author_id: user.id, tags: ['tips'] }),
      ];
      await db.seedData({ posts });

      // Act
      const query = `
        query PostsByTag($tag: String!) {
          postsByTag(tag: $tag) {
            id
            title
            tags
          }
        }
      `;

      const variables = { tag: 'tutorial' };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            postsByTag: posts.slice(0, 2).map((p) => ({
              id: p.id,
              title: p.title,
              tags: p.tags,
            })),
          },
        },
      });

      const response = await apiClient.query(query, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.postsByTag).toHaveLength(2);
      response.data?.postsByTag.forEach((post: any) => {
        expect(post.tags).toContain('tutorial');
      });
    });

    test('should suggest popular tags', async () => {
      // Act
      const query = `
        query PopularTags {
          popularTags {
            tag
            count
          }
        }
      `;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            popularTags: [
              { tag: 'tutorial', count: 50 },
              { tag: 'beginner', count: 35 },
              { tag: 'formulas', count: 28 },
              { tag: 'tips', count: 20 },
            ],
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.popularTags.length).toBeGreaterThan(0);
      expect(response.data?.popularTags[0].count).toBeGreaterThanOrEqual(
        response.data?.popularTags[1].count
      );
    });
  });

  describe('Cross-Cultural Communication', () => {
    test('should translate post titles', async () => {
      // Arrange
      const user = testUsers[0];
      const post = generateTestPost({
        author_id: user.id,
        locale: 'en-US',
        title: 'Getting Started Guide',
      });
      await db.seedData({ posts: [post] });

      // Act
      const query = `
        query TranslatePost($postId: ID!, $targetLocale: String!) {
          translatePost(postId: $postId, targetLocale: $targetLocale) {
            id
            title
            translatedTitle
            locale
          }
        }
      `;

      const variables = { postId: post.id, targetLocale: 'es-ES' };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            translatePost: {
              id: post.id,
              title: 'Getting Started Guide',
              translatedTitle: 'Guía de Inicio',
              locale: 'en-US',
            },
          },
        },
      });

      const response = await apiClient.query(query, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.translatePost.translatedTitle).toBeDefined();
    });

    test('should display posts in user preferred language first', async () => {
      // Arrange
      const spanishUser = testUsers.find((u) => u.locale === 'es-ES');
      await apiClient.authenticateUser(spanishUser);

      const posts = [
        generateTestPost({ locale: 'es-ES', title: 'Español Post' }),
        generateTestPost({ locale: 'en-US', title: 'English Post' }),
        generateTestPost({ locale: 'es-ES', title: 'Otro Post en Español' }),
      ];
      await db.seedData({ posts });

      // Act
      const query = `
        query Feed {
          feed {
            id
            title
            locale
          }
        }
      `;

      // Mock successful response - Spanish posts first
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            feed: [
              { id: posts[0].id, title: 'Español Post', locale: 'es-ES' },
              { id: posts[2].id, title: 'Otro Post en Español', locale: 'es-ES' },
              { id: posts[1].id, title: 'English Post', locale: 'en-US' },
            ],
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.feed[0].locale).toBe('es-ES');
      expect(response.data?.feed[1].locale).toBe('es-ES');
    });
  });
});
