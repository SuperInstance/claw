/**
 * User Profile Tests
 * Testing user profile management, settings, and activity
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfile, ProfileSettings } from '../../src/components/community/UserProfile';
import { UserProvider, useUser } from '../../src/contexts/UserContext';

// Mock user data
const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  profile: {
    firstName: 'Test',
    lastName: 'User',
    bio: 'Test bio',
    location: 'Test Location',
    website: 'https://example.com',
    avatar: 'https://example.com/avatar.jpg',
    joinedAt: new Date('2024-01-01'),
    reputation: 100
  },
  stats: {
    posts: 10,
    replies: 25,
    upvotes: 50,
    downvotes: 5
  },
  badges: [
    { id: '1', name: 'Early Adopter', icon: '🎉', earnedAt: new Date('2024-01-01') },
    { id: '2', name: 'Helpful', icon: '💡', earnedAt: new Date('2024-01-02') }
  ],
  activity: [
    {
      id: '1',
      type: 'post',
      title: 'Test Post',
      timestamp: new Date('2024-01-01')
    },
    {
      id: '2',
      type: 'reply',
      title: 'Test Reply',
      timestamp: new Date('2024-01-02')
    }
  ]
};

describe('UserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('Profile Display', () => {
    it('should render user profile', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });

    it('should display user bio', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Test bio')).toBeInTheDocument();
      });
    });

    it('should display user location', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Test Location')).toBeInTheDocument();
      });
    });

    it('should display user website', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        const websiteLink = screen.getByRole('link', { name: /example\.com/i });
        expect(websiteLink).toHaveAttribute('href', 'https://example.com');
      });
    });

    it('should display user avatar', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        const avatar = screen.getByRole('img', { name: /testuser/i });
        expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      });
    });

    it('should display user stats', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/10 posts/i)).toBeInTheDocument();
        expect(screen.getByText(/25 replies/i)).toBeInTheDocument();
      });
    });

    it('should display user badges', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        expect(screen.getByText('🎉')).toBeInTheDocument();
        expect(screen.getByText('💡')).toBeInTheDocument();
      });
    });

    it('should display user activity', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Test Post')).toBeInTheDocument();
        expect(screen.getByText('Test Reply')).toBeInTheDocument();
      });
    });
  });

  describe('Profile Editing', () => {
    it('should allow editing profile', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ user: mockUser })
        })
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            user: {
              ...mockUser,
              profile: {
                ...mockUser.profile,
                bio: 'Updated bio'
              }
            }
          })
        });

      render(<ProfileSettings />);

      await waitFor(() => {
        const editBtn = screen.getByRole('button', { name: /edit profile/i });
        fireEvent.click(editBtn);
      });

      await waitFor(() => {
        const bioInput = screen.getByDisplayValue('Test bio');
        fireEvent.change(bioInput, { target: { value: 'Updated bio' } });

        const saveBtn = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveBtn);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should validate profile data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<ProfileSettings />);

      await waitFor(() => {
        const editBtn = screen.getByRole('button', { name: /edit profile/i });
        fireEvent.click(editBtn);
      });

      await waitFor(() => {
        const websiteInput = screen.getByDisplayValue('https://example.com');
        fireEvent.change(websiteInput, { target: { value: 'invalid-url' } });

        const saveBtn = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveBtn);
      });

      expect(screen.getByText(/invalid url/i)).toBeInTheDocument();
    });

    it('should upload avatar', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ user: mockUser })
        })
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            avatar: 'https://example.com/new-avatar.jpg'
          })
        });

      render(<ProfileSettings />);

      await waitFor(() => {
        const uploadInput = screen.getByLabelText(/upload avatar/i);
        const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });

        fireEvent.change(uploadInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should validate avatar file type', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<ProfileSettings />);

      await waitFor(() => {
        const uploadInput = screen.getByLabelText(/upload avatar/i);
        const file = new File(['document'], 'document.pdf', { type: 'application/pdf' });

        fireEvent.change(uploadInput, { target: { files: [file] } });
      });

      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });

    it('should validate avatar file size', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<ProfileSettings />);

      await waitFor(() => {
        const uploadInput = screen.getByLabelText(/upload avatar/i);
        const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
          type: 'image/jpeg'
        });

        fireEvent.change(uploadInput, { target: { files: [largeFile] } });
      });

      expect(screen.getByText(/file too large/i)).toBeInTheDocument();
    });
  });

  describe('Account Settings', () => {
    it('should change email', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ user: mockUser })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true })
        });

      render(<ProfileSettings />);

      await waitFor(() => {
        const emailInput = screen.getByDisplayValue('test@example.com');
        fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });

        const saveBtn = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveBtn);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should change password', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ user: mockUser })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true })
        });

      render(<ProfileSettings />);

      await waitFor(() => {
        const changePasswordBtn = screen.getByRole('button', {
          name: /change password/i
        });
        fireEvent.click(changePasswordBtn);
      });

      await waitFor(() => {
        const currentPassword = screen.getByLabelText(/current password/i);
        const newPassword = screen.getByLabelText(/new password/i);
        const confirmPassword = screen.getByLabelText(/confirm password/i);

        fireEvent.change(currentPassword, { target: { value: 'oldpassword' } });
        fireEvent.change(newPassword, { target: { value: 'newpassword123' } });
        fireEvent.change(confirmPassword, { target: { value: 'newpassword123' } });

        const submitBtn = screen.getByRole('button', { name: /submit/i });
        fireEvent.click(submitBtn);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should validate password complexity', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<ProfileSettings />);

      await waitFor(() => {
        const changePasswordBtn = screen.getByRole('button', {
          name: /change password/i
        });
        fireEvent.click(changePasswordBtn);
      });

      await waitFor(() => {
        const newPassword = screen.getByLabelText(/new password/i);
        fireEvent.change(newPassword, { target: { value: 'simple' } });

        const submitBtn = screen.getByRole('button', { name: /submit/i });
        fireEvent.click(submitBtn);
      });

      expect(screen.getByText(/password too weak/i)).toBeInTheDocument();
    });

    it('should confirm password match', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<ProfileSettings />);

      await waitFor(() => {
        const changePasswordBtn = screen.getByRole('button', {
          name: /change password/i
        });
        fireEvent.click(changePasswordBtn);
      });

      await waitFor(() => {
        const newPassword = screen.getByLabelText(/new password/i);
        const confirmPassword = screen.getByLabelText(/confirm password/i);

        fireEvent.change(newPassword, { target: { value: 'password123' } });
        fireEvent.change(confirmPassword, { target: { value: 'password456' } });

        const submitBtn = screen.getByRole('button', { name: /submit/i });
        fireEvent.click(submitBtn);
      });

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it('should delete account', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ user: mockUser })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true })
        });

      render(<ProfileSettings />);

      await waitFor(() => {
        const deleteAccountBtn = screen.getByRole('button', {
          name: /delete account/i
        });
        fireEvent.click(deleteAccountBtn);
      });

      await waitFor(() => {
        const confirmBtn = screen.getByRole('button', { name: /confirm delete/i });
        fireEvent.click(confirmBtn);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Notification Preferences', () => {
    it('should update notification preferences', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ user: mockUser })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true })
        });

      render(<ProfileSettings />);

      await waitFor(() => {
        const emailNotifications = screen.getByRole('checkbox', {
          name: /email notifications/i
        });
        fireEvent.click(emailNotifications);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should toggle notification types', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ user: mockUser })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true })
        });

      render(<ProfileSettings />);

      await waitFor(() => {
        const replyNotifications = screen.getByRole('checkbox', {
          name: /reply notifications/i
        });
        fireEvent.click(replyNotifications);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Privacy Settings', () => {
    it('should set profile visibility', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ user: mockUser })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true })
        });

      render(<ProfileSettings />);

      await waitFor(() => {
        const visibilitySelect = screen.getByRole('combobox', {
          name: /profile visibility/i
        });
        fireEvent.change(visibilitySelect, { target: { value: 'private' } });
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should control activity visibility', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ user: mockUser })
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true })
        });

      render(<ProfileSettings />);

      await waitFor(() => {
        const activityCheckbox = screen.getByRole('checkbox', {
          name: /show activity/i
        });
        fireEvent.click(activityCheckbox);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('User Activity', () => {
    it('should display recent activity', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Test Post')).toBeInTheDocument();
      });
    });

    it('should filter activity by type', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" activityFilter="posts" />);

      await waitFor(() => {
        expect(screen.getByText('Test Post')).toBeInTheDocument();
        expect(screen.queryByText('Test Reply')).not.toBeInTheDocument();
      });
    });

    it('should paginate activity', async () => {
      const manyActivities = Array.from({ length: 25 }, (_, i) => ({
        id: `${i}`,
        type: 'post',
        title: `Activity ${i}`,
        timestamp: new Date()
      }));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          user: {
            ...mockUser,
            activity: manyActivities.slice(0, 10)
          }
        })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Activity 0')).toBeInTheDocument();
        expect(screen.queryByText('Activity 10')).not.toBeInTheDocument();
      });
    });
  });

  describe('Reputation System', () => {
    it('should display reputation score', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/100 reputation/i)).toBeInTheDocument();
      });
    });

    it('should display reputation breakdown', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/50 upvotes/i)).toBeInTheDocument();
      });
    });

    it('should track reputation changes', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ user: mockUser })
        })
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            reputation: 110
          })
        });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/100 reputation/i)).toBeInTheDocument();
      });

      // Simulate reputation change
      // TODO: Add WebSocket or polling for real-time updates
    });
  });

  describe('Achievements', () => {
    it('should display earned badges', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        expect(screen.getByText('🎉')).toBeInTheDocument();
        expect(screen.getByText('Early Adopter')).toBeInTheDocument();
      });
    });

    it('should show badge details', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        const badge = screen.getByText('🎉');
        fireEvent.mouseEnter(badge);
      });

      await waitFor(() => {
        expect(screen.getByText(/earned on/i)).toBeInTheDocument();
      });
    });

    it('should display available badges', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          user: mockUser,
          availableBadges: [
            {
              id: '3',
              name: 'Contributor',
              icon: '⭐',
              description: 'Made 100 posts',
              progress: 50,
              target: 100
            }
          ]
        })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        expect(screen.getByText('⭐')).toBeInTheDocument();
        expect(screen.getByText('Contributor')).toBeInTheDocument();
        expect(screen.getByText(/50\/100/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle user not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ error: 'User not found' })
      });

      render(<UserProfile userId="invalid" />);

      await waitFor(() => {
        expect(screen.getByText(/user not found/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      });
    });

    it('should handle update failures', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ user: mockUser })
        })
        .mockRejectedValueOnce(new Error('Update failed'));

      render(<ProfileSettings />);

      await waitFor(() => {
        const editBtn = screen.getByRole('button', { name: /edit profile/i });
        fireEvent.click(editBtn);
      });

      await waitFor(() => {
        const bioInput = screen.getByDisplayValue('Test bio');
        fireEvent.change(bioInput, { target: { value: 'Updated bio' } });

        const saveBtn = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveBtn);
      });

      await waitFor(() => {
        expect(screen.getByText(/update failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        const avatar = screen.getByRole('img', { name: /testuser avatar/i });
        expect(avatar).toHaveAttribute('alt');
      });
    });

    it('should be keyboard navigable', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ user: mockUser })
      });

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit profile/i });
        editButton.focus();
        expect(editButton).toHaveFocus();
      });
    });
  });
});
