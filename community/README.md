# Spreadsheet Moment - Community Features

Complete community platform for Spreadsheet Moment with forums, templates, user profiles, gamification, and moderation.

## Features

### Forum
- Discussion forums with categories
- Tags and search
- Voting on posts and replies
- Accepted answers
- Pinned and locked posts
- Real-time notifications

### Template Gallery
- Browse and share templates
- Categories and tags
- Ratings and reviews
- Download tracking
- Template forking
- Featured templates

### User Profiles
- Customizable profiles
- Reputation system
- Badges and achievements
- Activity feed
- Statistics tracking
- Social links

### Gamification
- Reputation points
- Multiple badge tiers (common, rare, epic, legendary)
- User levels and titles
- Leaderboards
- Achievement tracking

### Sharing
- Share spreadsheets to community
- Clone templates
- Fork existing templates
- Social media sharing
- Embed codes
- License options

### Search
- Full-text search
- Faceted filtering
- Search suggestions
- Popular searches
- Trending queries

### Moderation
- Content flagging
- Moderation queue
- User warnings
- Content removal
- User banning
- Moderation analytics

## Installation

```bash
# Install dependencies
npm install

# Set up database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

## Database Schema

See `database.ts` for complete PostgreSQL schema including:
- Users and authentication
- Forum posts and replies
- Templates and reviews
- Badges and achievements
- Moderation flags and actions
- Search indexing
- Notifications

## API Reference

See `api.ts` for complete REST API documentation. All endpoints are prefixed with `/api/community`.

### Key Endpoints

**Forum**
- `GET /forum/posts` - List posts
- `POST /forum/posts` - Create post
- `POST /forum/posts/:id/vote` - Vote on post
- `POST /forum/posts/:id/replies` - Add reply

**Templates**
- `GET /templates` - List templates
- `POST /templates` - Share template
- `POST /templates/:id/download` - Download template
- `POST /templates/:id/reviews` - Rate template

**Users**
- `GET /users/:id` - Get profile
- `PUT /users/:id` - Update profile
- `GET /users/:id/activity` - Get activity

**Search**
- `GET /search` - Search community
- `GET /search/suggestions` - Get suggestions

**Moderation**
- `POST /moderation/flag` - Flag content
- `GET /moderation/queue` - Get queue (moderators only)

## Usage

### Creating a Forum Post

```typescript
import { ForumManager } from './community/forum';

const forumManager = new ForumManager(database);

const post = await forumManager.createPost({
  title: 'How to create pivot tables?',
  content: 'I need help understanding pivot tables...',
  category: 'help',
  tags: ['pivot-tables', 'help'],
  authorId: 'user-123',
  authorName: 'John Doe',
  authorAvatar: '/avatars/john.png',
});
```

### Sharing a Template

```typescript
import { SharingManager } from './community/sharing';

const sharingManager = new SharingManager(
  templateManager,
  userManager,
  gamificationManager,
  database
);

const result = await sharingManager.shareToCommunity(
  'user-123',
  'spreadsheet-abc',
  {
    title: 'Budget Tracker',
    description: 'Track your monthly budget',
    category: 'finance',
    tags: ['budget', 'finance'],
  },
  {
    publishToGallery: true,
    allowComments: true,
    allowRating: true,
    allowForks: true,
    license: 'cc-by',
  }
);
```

### Checking Achievements

```typescript
import { GamificationManager } from './community/gamification';

const gamificationManager = new GamificationManager(database);

const newBadges = await gamificationManager.checkAchievements('user-123');

console.log('New badges earned:', newBadges);
```

### Searching

```typescript
import { SearchManager } from './community/search';

const searchManager = new SearchManager(database);

const results = await searchManager.search({
  q: 'pivot tables',
  type: 'all',
  sortBy: 'relevance',
});

console.log('Search results:', results);
```

### Moderation

```typescript
import { ModerationManager } from './community/moderation';

const moderationManager = new ModerationManager(database);

// Flag content
const flag = await moderationManager.flagContent({
  contentType: 'post',
  contentId: 'post-abc',
  reason: 'Inappropriate content',
  category: 'inappropriate',
  description: 'This post contains offensive language',
  flaggedBy: 'user-456',
  flaggedByName: 'Jane Smith',
});

// Review flag (moderator)
const reviewed = await moderationManager.reviewFlag('flag-123', {
  action: 'approve',
  moderatorId: 'mod-1',
  moderatorName: 'Admin',
  actionTaken: 'deleted',
  moderatorNote: 'Removed offensive content',
});
```

## Architecture

### Database Layer
- `ForumDatabase` - Forum data interface
- `TemplateDatabase` - Template data interface
- `UserDatabase` - User data interface
- `GamificationDatabase` - Gamification data interface
- `SharingDatabase` - Sharing data interface
- `SearchDatabase` - Search data interface
- `ModerationDatabase` - Moderation data interface

### Manager Layer
- `ForumManager` - Forum operations
- `TemplateManager` - Template operations
- `UserManager` - User profile operations
- `GamificationManager` - Badges and achievements
- `SharingManager` - Sharing and forking
- `SearchManager` - Search functionality
- `ModerationManager` - Content moderation

### API Layer
- REST endpoints in `api.ts`
- Request/response validation
- Error handling
- Authentication middleware

### Frontend Components
- React components in `CommunityFeatures.tsx`
- UI components for forums, templates, profiles
- Real-time updates
- Responsive design

## Badges

### Common (White)
- First Steps - Create your first post
- Helper - Post your first reply
- Creator - Publish your first template

### Rare (Blue)
- Respected Member - Reach 100 reputation
- Template Master - Publish 10 templates
- Problem Solver - Have 50 answers accepted
- Bug Hunter - Report 10 confirmed bugs
- Early Adopter - Join in first month

### Epic (Purple)
- Prolific Poster - Create 100 posts
- Discussion Master - Post 500 replies
- Visionary - Suggest implemented feature

### Legendary (Orange)
- Community Leader - Reach 1,000 reputation
- Mentor - Help 100 users

## License

MIT License - Copyright (c) 2026 SuperInstance Research Team

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For issues and questions, please use the community forum at:
https://spreadsheetmoment.com/community
