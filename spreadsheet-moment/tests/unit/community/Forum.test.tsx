/**
 * Community Forum Tests
 * Testing forum functionality, posts, replies, and voting
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Forum, Post, Reply } from '../../src/components/community/Forum';
import { ForumProvider, useForum } from '../../src/contexts/ForumContext';

// Mock data
const mockPosts = [
  {
    id: '1',
    title: 'Test Post 1',
    content: 'Test content 1',
    authorId: 'user1',
    author: { id: 'user1', username: 'testuser1' },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    upvotes: 5,
    downvotes: 1,
    replies: []
  },
  {
    id: '2',
    title: 'Test Post 2',
    content: 'Test content 2',
    authorId: 'user2',
    author: { id: 'user2', username: 'testuser2' },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    upvotes: 10,
    downvotes: 2,
    replies: [
      {
        id: 'r1',
        content: 'Test reply',
        authorId: 'user1',
        author: { id: 'user1', username: 'testuser1' },
        createdAt: new Date('2024-01-03'),
        upvotes: 3,
        downvotes: 0
      }
    ]
  }
];

describe('Forum', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('Post List', () => {
    it('should render list of posts', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ posts: mockPosts })
      });

      render(<Forum />);

      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
        expect(screen.getByText('Test Post 2')).toBeInTheDocument();
      });
    });

    it('should display loading state initially', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      render(<Forum />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should handle empty post list', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ posts: [] })
      });

      render(<Forum />);

      await waitFor(() => {
        expect(screen.getByText(/no posts/i)).toBeInTheDocument();
      });
    });

    it('should handle error state', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to load'));

      render(<Forum />);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should sort posts by upvotes', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ posts: mockPosts.reverse() })
      });

      render(<Forum sortBy="upvotes" />);

      await waitFor(() => {
        const posts = screen.getAllByTestId('post-item');
        expect(posts[0]).toHaveTextContent('Test Post 2');
      });
    });

    it('should sort posts by date', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ posts: mockPosts })
      });

      render(<Forum sortBy="date" />);

      await waitFor(() => {
        const posts = screen.getAllByTestId('post-item');
        expect(posts[0]).toHaveTextContent('Test Post 1');
      });
    });

    it('should filter posts by category', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          posts: mockPosts.filter(p => p.category === 'help')
        })
      });

      render(<Forum category="help" />);

      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      });
    });

    it('should search posts by keyword', async () => {
      const searchQuery = 'Test Post 1';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          posts: mockPosts.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        })
      });

      render(<Forum search={searchQuery} />);

      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Post 2')).not.toBeInTheDocument();
      });
    });
  });

  describe('Single Post', () => {
    it('should render post details', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ post: mockPosts[0] })
      });

      render(<Post postId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
        expect(screen.getByText('Test content 1')).toBeInTheDocument();
      });
    });

    it('should display post author', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ post: mockPosts[0] })
      });

      render(<Post postId="1" />);

      await waitFor(() => {
        expect(screen.getByText('testuser1')).toBeInTheDocument();
      });
    });

    it('should display post timestamp', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ post: mockPosts[0] })
      });

      render(<Post postId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/2024-01-01/)).toBeInTheDocument();
      });
    });

    it('should display vote counts', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ post: mockPosts[0] })
      });

      render(<Post postId="1" />);

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument(); // upvotes
      });
    });

    it('should handle upvoting', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ post: mockPosts[0] })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, upvotes: 6 })
        });

      render(<Post postId="1" />);

      await waitFor(() => {
        const upvoteBtn = screen.getByRole('button', { name: /upvote/i });
        fireEvent.click(upvoteBtn);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle downvoting', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ post: mockPosts[0] })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, downvotes: 2 })
        });

      render(<Post postId="1" />);

      await waitFor(() => {
        const downvoteBtn = screen.getByRole('button', { name: /downvote/i });
        fireEvent.click(downvoteBtn);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Replies', () => {
    it('should render post replies', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ post: mockPosts[1] })
      });

      render(<Post postId="2" />);

      await waitFor(() => {
        expect(screen.getByText('Test reply')).toBeInTheDocument();
      });
    });

    it('should allow adding replies', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ post: mockPosts[0] })
        })
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            reply: {
              id: 'r2',
              content: 'New reply',
              authorId: 'user1',
              author: { id: 'user1', username: 'testuser1' },
              createdAt: new Date(),
              upvotes: 0,
              downvotes: 0
            }
          })
        });

      render(<Post postId="1" />);

      await waitFor(async () => {
        const replyInput = screen.getByPlaceholderText(/write a reply/i);
        const submitBtn = screen.getByRole('button', { name: /submit/i });

        fireEvent.change(replyInput, { target: { value: 'New reply' } });
        fireEvent.click(submitBtn);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should validate reply content', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ post: mockPosts[0] })
      });

      render(<Post postId="1" />);

      await waitFor(() => {
        const submitBtn = screen.getByRole('button', { name: /submit/i });
        fireEvent.click(submitBtn);
      });

      expect(screen.getByText(/content is required/i)).toBeInTheDocument();
    });

    it('should handle reply voting', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ post: mockPosts[1] })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, upvotes: 4 })
        });

      render(<Post postId="2" />);

      await waitFor(() => {
        const replyUpvote = screen.getAllByRole('button', { name: /upvote/i })[1];
        fireEvent.click(replyUpvote);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should sort replies by votes', async () => {
      const postWithMultipleReplies = {
        ...mockPosts[1],
        replies: [
          { ...mockPosts[1].replies[0], upvotes: 5 },
          {
            id: 'r2',
            content: 'Less popular reply',
            authorId: 'user1',
            author: { id: 'user1', username: 'testuser1' },
            createdAt: new Date(),
            upvotes: 1,
            downvotes: 0
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ post: postWithMultipleReplies })
      });

      render(<Post postId="2" replySort="votes" />);

      await waitFor(() => {
        const replies = screen.getAllByTestId('reply-item');
        expect(replies[0]).toHaveTextContent('Test reply');
      });
    });
  });

  describe('Post Creation', () => {
    it('should create new post', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          post: {
            id: '3',
            title: 'New Post',
            content: 'New content',
            authorId: 'user1',
            author: { id: 'user1', username: 'testuser1' },
            createdAt: new Date(),
            upvotes: 0,
            downvotes: 0,
            replies: []
          }
        })
      });

      const TestCreate = () => {
        const { createPost } = useForum();
        const [title, setTitle] = React.useState('');
        const [content, setContent] = React.useState('');

        const handleSubmit = async () => {
          await createPost({ title, content });
        };

        return (
          <form onSubmit={handleSubmit}>
            <input
              data-testid="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              data-testid="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button type="submit">Create</button>
          </form>
        );
      };

      render(
        <ForumProvider>
          <TestCreate />
        </ForumProvider>
      );

      const titleInput = screen.getByTestId('title');
      const contentInput = screen.getByTestId('content');
      const submitBtn = screen.getByRole('button', { name: /create/i });

      fireEvent.change(titleInput, { target: { value: 'New Post' } });
      fireEvent.change(contentInput, { target: { value: 'New content' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should validate post title', async () => {
      const TestCreate = () => {
        const { createPost } = useForum();

        return (
          <form onSubmit={() => createPost({ title: '', content: 'Content' })}>
            <button type="submit">Create</button>
          </form>
        );
      };

      render(
        <ForumProvider>
          <TestCreate />
        </ForumProvider>
      );

      const submitBtn = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });

    it('should validate post content', async () => {
      const TestCreate = () => {
        const { createPost } = useForum();

        return (
          <form onSubmit={() => createPost({ title: 'Title', content: '' })}>
            <button type="submit">Create</button>
          </form>
        );
      };

      render(
        <ForumProvider>
          <TestCreate />
        </ForumProvider>
      );

      const submitBtn = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/content is required/i)).toBeInTheDocument();
    });
  });

  describe('Post Editing', () => {
    it('should edit existing post', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ post: mockPosts[0] })
        })
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            post: {
              ...mockPosts[0],
              title: 'Updated Title',
              content: 'Updated content'
            }
          })
        });

      render(<Post postId="1" />);

      await waitFor(() => {
        const editBtn = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editBtn);
      });

      await waitFor(() => {
        const titleInput = screen.getByDisplayValue('Test Post 1');
        const contentInput = screen.getByDisplayValue('Test content 1');
        const saveBtn = screen.getByRole('button', { name: /save/i });

        fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
        fireEvent.change(contentInput, { target: { value: 'Updated content' } });
        fireEvent.click(saveBtn);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should cancel editing', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ post: mockPosts[0] })
      });

      render(<Post postId="1" />);

      await waitFor(() => {
        const editBtn = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editBtn);
      });

      await waitFor(() => {
        const cancelBtn = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelBtn);
      });

      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Test Post 1')).not.toBeInTheDocument();
    });
  });

  describe('Post Deletion', () => {
    it('should delete post', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ post: mockPosts[0] })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true })
        });

      render(<Post postId="1" />);

      await waitFor(() => {
        const deleteBtn = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteBtn);
      });

      await waitFor(() => {
        const confirmBtn = screen.getByRole('button', { name: /confirm/i });
        fireEvent.click(confirmBtn);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should confirm before deletion', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ post: mockPosts[0] })
      });

      render(<Post postId="1" />);

      await waitFor(() => {
        const deleteBtn = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteBtn);
      });

      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    it('should cancel deletion', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ post: mockPosts[0] })
      });

      render(<Post postId="1" />);

      await waitFor(() => {
        const deleteBtn = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteBtn);
      });

      await waitFor(() => {
        const cancelBtn = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelBtn);
      });

      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });
  });

  describe('Moderation', () => {
    it('should flag inappropriate content', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ post: mockPosts[0] })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true })
        });

      render(<Post postId="1" />);

      await waitFor(() => {
        const flagBtn = screen.getByRole('button', { name: /flag/i });
        fireEvent.click(flagBtn);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should lock post', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ post: mockPosts[0] })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true })
        });

      render(<Post postId="1" />);

      await waitFor(() => {
        const lockBtn = screen.getByRole('button', { name: /lock/i });
        fireEvent.click(lockBtn);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should pin post', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ post: mockPosts[0] })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true })
        });

      render(<Post postId="1" />);

      await waitFor(() => {
        const pinBtn = screen.getByRole('button', { name: /pin/i });
        fireEvent.click(pinBtn);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Pagination', () => {
    it('should paginate post list', async () => {
      const manyPosts = Array.from({ length: 25 }, (_, i) => ({
        ...mockPosts[0],
        id: `${i}`,
        title: `Post ${i}`
      }));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          posts: manyPosts.slice(0, 10),
          total: 25,
          page: 1,
          pages: 3
        })
      });

      render(<Forum />);

      await waitFor(() => {
        expect(screen.getByText('Post 0')).toBeInTheDocument();
        expect(screen.queryByText('Post 10')).not.toBeInTheDocument();
      });
    });

    it('should handle page navigation', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({
            posts: mockPosts,
            total: 25,
            page: 1,
            pages: 3
          })
        })
        .mockResolvedValueOnce({
          json: async () => ({
            posts: mockPosts,
            total: 25,
            page: 2,
            pages: 3
          })
        });

      render(<Forum />);

      await waitFor(() => {
        const nextPageBtn = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextPageBtn);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should update post list in real-time', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ posts: mockPosts })
      });

      render(<Forum />);

      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      });

      // Simulate real-time update
      const newPost = {
        ...mockPosts[0],
        id: '3',
        title: 'Real-time Post'
      };

      // TODO: Add WebSocket mock and event handling
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ posts: mockPosts })
      });

      render(<Forum />);

      await waitFor(() => {
        const upvoteButtons = screen.getAllByRole('button', { name: /upvote/i });
        upvoteButtons.forEach(btn => {
          expect(btn).toHaveAttribute('aria-label');
        });
      });
    });

    it('should be keyboard navigable', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ posts: mockPosts })
      });

      render(<Forum />);

      await waitFor(() => {
        const firstPost = screen.getByTestId('post-item');
        firstPost.focus();
        expect(firstPost).toHaveFocus();
      });
    });
  });
});
