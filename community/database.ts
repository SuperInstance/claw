/**
 * Spreadsheet Moment - Community Database Schema
 *
 * Complete database schema and SQL migration scripts
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

/**
 * SQL Schema for PostgreSQL
 */
export const COMMUNITY_SCHEMA = `
-- ============================================================================
-- Community Forum Schema
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url VARCHAR(512),
  bio TEXT,
  location VARCHAR(255),
  website VARCHAR(512),
  twitter VARCHAR(255),
  github VARCHAR(255),
  linkedin VARCHAR(255),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_reputation ON users(reputation DESC);
CREATE INDEX idx_users_joined_at ON users(joined_at DESC);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  mention_notifications BOOLEAN DEFAULT TRUE,
  reply_notifications BOOLEAN DEFAULT TRUE,
  badge_notifications BOOLEAN DEFAULT TRUE,
  privacy_show_profile BOOLEAN DEFAULT TRUE,
  privacy_show_email BOOLEAN DEFAULT FALSE,
  privacy_show_stats BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User statistics
CREATE TABLE IF NOT EXISTS user_statistics (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  posts INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  templates INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  upvotes_received INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  reward_reputation INTEGER DEFAULT 0
);

-- User badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id VARCHAR(100) NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- Forum categories
CREATE TABLE IF NOT EXISTS forum_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum posts
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id VARCHAR(50) NOT NULL REFERENCES forum_categories(id),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  votes INTEGER DEFAULT 0,
  pinned BOOLEAN DEFAULT FALSE,
  locked BOOLEAN DEFAULT FALSE,
  accepted_reply_id UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_category_id ON forum_posts(category_id);
CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX idx_forum_posts_votes ON forum_posts(votes DESC);
CREATE INDEX idx_forum_posts_tags ON forum_posts USING GIN(tags);
CREATE INDEX idx_forum_posts_fulltext ON forum_posts USING GIN(to_tsvector('english', title || ' ' || content));

-- Forum replies
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  votes INTEGER DEFAULT 0,
  accepted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX idx_forum_replies_author_id ON forum_replies(author_id);
CREATE INDEX idx_forum_replies_created_at ON forum_replies(created_at ASC);

-- Post votes
CREATE TABLE IF NOT EXISTS post_votes (
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote INTEGER NOT NULL CHECK (vote IN (-1, 1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- Reply votes
CREATE TABLE IF NOT EXISTS reply_votes (
  reply_id UUID NOT NULL REFERENCES forum_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote INTEGER NOT NULL CHECK (vote IN (-1, 1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (reply_id, user_id)
);

-- ============================================================================
-- Template Gallery Schema
-- ============================================================================

-- Template categories
CREATE TABLE IF NOT EXISTS template_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Templates
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url VARCHAR(512),
  category_id VARCHAR(50) NOT NULL REFERENCES template_categories(id),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spreadsheet_id UUID NOT NULL,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_templates_author_id ON templates(author_id);
CREATE INDEX idx_templates_category_id ON templates(category_id);
CREATE INDEX idx_templates_downloads ON templates(downloads DESC);
CREATE INDEX idx_templates_rating ON templates(rating DESC);
CREATE INDEX idx_templates_featured ON templates(featured, created_at DESC);
CREATE INDEX idx_templates_tags ON templates USING GIN(tags);
CREATE INDEX idx_templates_fulltext ON templates USING GIN(to_tsvector('english', name || ' ' || description));

-- Template reviews
CREATE TABLE IF NOT EXISTS template_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  helpful INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

CREATE INDEX idx_template_reviews_template_id ON template_reviews(template_id);
CREATE INDEX idx_template_reviews_user_id ON template_reviews(user_id);
CREATE INDEX idx_template_reviews_rating ON template_reviews(rating);

-- Template review helpful votes
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  review_id UUID NOT NULL REFERENCES template_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id)
);

-- Template downloads
CREATE TABLE IF NOT EXISTS template_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_template_downloads_template_id ON template_downloads(template_id);
CREATE INDEX idx_template_downloads_user_id ON template_downloads(user_id);

-- ============================================================================
-- Sharing Schema
-- ============================================================================

-- Template shares
CREATE TABLE IF NOT EXISTS template_shares (
  template_id UUID PRIMARY KEY REFERENCES templates(id) ON DELETE CASCADE,
  allow_comments BOOLEAN DEFAULT TRUE,
  allow_rating BOOLEAN DEFAULT TRUE,
  allow_forks BOOLEAN DEFAULT TRUE,
  license VARCHAR(50) DEFAULT 'cc-by',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template forks
CREATE TABLE IF NOT EXISTS template_forks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  forked_template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  forked_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  forked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_template_forks_original ON template_forks(original_template_id);
CREATE INDEX idx_template_forks_forked_by ON template_forks(forked_by);

-- ============================================================================
-- Moderation Schema
-- ============================================================================

-- Content flags
CREATE TABLE IF NOT EXISTS content_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('post', 'reply', 'template', 'user')),
  content_id UUID NOT NULL,
  reason VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('spam', 'harassment', 'inappropriate', 'copyright', 'malware', 'other')),
  description TEXT,
  flagged_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  priority VARCHAR(20) DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  moderator_note TEXT,
  action_taken TEXT
);

CREATE INDEX idx_content_flags_content ON content_flags(content_type, content_id);
CREATE INDEX idx_content_flags_status ON content_flags(status, created_at ASC);
CREATE INDEX idx_content_flags_priority ON content_flags(priority, created_at ASC);
CREATE INDEX idx_content_flags_flagged_by ON content_flags(flagged_by);

-- User warnings
CREATE TABLE IF NOT EXISTS user_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  warned_by UUID NOT NULL REFERENCES users(id),
  warning_type VARCHAR(20) DEFAULT 'informal' CHECK (warning_type IN ('formal', 'informal')),
  expires_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_warnings_user_id ON user_warnings(user_id);
CREATE INDEX idx_user_warnings_created_at ON user_warnings(created_at DESC);

-- Moderation actions
CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'reply', 'template', 'user')),
  target_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  reason TEXT,
  performed_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_moderation_actions_target ON moderation_actions(target_type, target_id);
CREATE INDEX idx_moderation_actions_performed_by ON moderation_actions(performed_by);

-- Banned users
CREATE TABLE IF NOT EXISTS banned_users (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  permanent BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_banned_users_expires_at ON banned_users(expires_at);

-- ============================================================================
-- Search Schema
-- ============================================================================

-- Search queries
CREATE TABLE IF NOT EXISTS search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  result_count INTEGER,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_queries_query ON search_queries(query);
CREATE INDEX idx_search_queries_created_at ON search_queries(created_at DESC);
CREATE INDEX idx_search_queries_user_id ON search_queries(user_id);

-- ============================================================================
-- Activity Feed Schema
-- ============================================================================

-- User activities
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  target_title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_activities_user_id ON user_activities(user_id, created_at DESC);
CREATE INDEX idx_user_activities_target ON user_activities(activity_type, target_id);

-- ============================================================================
-- Notifications Schema
-- ============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(user_id, read, created_at DESC);
`;

/**
 * Seed data for badges
 */
export const SEED_BADGES = `
INSERT INTO badges (id, name, description, icon, rarity, reward_reputation) VALUES
-- Posting badges
('first_post', 'First Steps', 'Created your first post', '📝', 'common', 10),
('prolific_poster', 'Prolific Poster', 'Created 100 posts', '✍️', 'epic', 100),
('great_question', 'Great Question', 'Your post received 50 upvotes', '👍', 'rare', 50),

-- Reply badges
('first_reply', 'Helper', 'Posted your first reply', '💬', 'common', 5),
('prolific_replier', 'Discussion Master', 'Posted 500 replies', '🗨️', 'epic', 75),
('helpful_answer', 'Problem Solver', 'Your answer was accepted 50 times', '✅', 'rare', 50),

-- Template badges
('first_template', 'Creator', 'Published your first template', '📊', 'common', 15),
('template_creator', 'Template Master', 'Published 10 templates', '📋', 'rare', 50),

-- Reputation badges
('respected_member', 'Respected Member', 'Reached 100 reputation', '⭐', 'rare', 25),
('community_leader', 'Community Leader', 'Reached 1,000 reputation', '👑', 'legendary', 100),

-- Special badges
('bug_hunter', 'Bug Hunter', 'Reported 10 confirmed bugs', '🐛', 'rare', 50),
('visionary', 'Visionary', 'Suggested a feature that was implemented', '💡', 'epic', 75),
('critic', 'Critic', 'Wrote 25 template reviews', '⭐', 'rare', 40),
('mentor', 'Mentor', 'Helped 100 users through answers', '🤝', 'legendary', 100),
('early_adopter', 'Early Adopter', 'Joined in the first month', '🚀', 'rare', 30)
ON CONFLICT (id) DO NOTHING;
`;

/**
 * Seed data for categories
 */
export const SEED_CATEGORIES = `
-- Forum categories
INSERT INTO forum_categories (id, name, icon, description, sort_order) VALUES
('general', 'General Discussion', '💬', 'General topics and chat', 1),
('help', 'Help & Support', '❓', 'Get help with spreadsheets', 2),
('templates', 'Templates', '📊', 'Share and discuss templates', 3),
('features', 'Feature Requests', '💡', 'Suggest new features', 4),
('bugs', 'Bug Reports', '🐛', 'Report and track bugs', 5),
('announcements', 'Announcements', '📢', 'Official announcements', 0)
ON CONFLICT (id) DO NOTHING;

-- Template categories
INSERT INTO template_categories (id, name, icon, description, sort_order) VALUES
('business', 'Business', '💼', 'Business templates', 1),
('finance', 'Finance', '💰', 'Financial templates', 2),
('project-management', 'Project Management', '📋', 'Project management templates', 3),
('marketing', 'Marketing', '📈', 'Marketing templates', 4),
('education', 'Education', '🎓', 'Educational templates', 5),
('personal', 'Personal', '👤', 'Personal templates', 6),
('data-analysis', 'Data Analysis', '📊', 'Data analysis templates', 7),
('inventory', 'Inventory', '📦', 'Inventory management templates', 8)
ON CONFLICT (id) DO NOTHING;
`;

/**
 * Database utility functions
 */
export const DB_FUNCTIONS = `
-- Update user statistics trigger
CREATE OR REPLACE FUNCTION update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'forum_posts' THEN
    UPDATE user_statistics
    SET posts = posts + 1,
        updated_at = NOW()
    WHERE user_id = NEW.author_id;
  ELSIF TG_TABLE_NAME = 'forum_replies' THEN
    UPDATE user_statistics
    SET replies = replies + 1,
        updated_at = NOW()
    WHERE user_id = NEW.author_id;
  ELSIF TG_TABLE_NAME = 'templates' THEN
    UPDATE user_statistics
    SET templates = templates + 1,
        updated_at = NOW()
    WHERE user_id = NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_post_stats ON forum_posts;
CREATE TRIGGER trigger_update_post_stats
  AFTER INSERT ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_statistics();

DROP TRIGGER IF EXISTS trigger_update_reply_stats ON forum_replies;
CREATE TRIGGER trigger_update_reply_stats
  AFTER INSERT ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_user_statistics();

DROP TRIGGER IF EXISTS trigger_update_template_stats ON templates;
CREATE TRIGGER trigger_update_template_stats
  AFTER INSERT ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_user_statistics();

-- Update template rating trigger
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE templates
  SET rating = (
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM template_reviews
        WHERE template_id = NEW.template_id
      ),
      review_count = (
        SELECT COUNT(*)
        FROM template_reviews
        WHERE template_id = NEW.template_id
      ),
      updated_at = NOW()
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_template_rating ON template_reviews;
CREATE TRIGGER trigger_update_template_rating
  AFTER INSERT OR UPDATE ON template_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_template_rating();

-- Update post votes trigger
CREATE OR REPLACE FUNCTION update_post_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts
    SET votes = votes + NEW.vote
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE forum_posts
    SET votes = votes + (NEW.vote - OLD.vote)
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts
    SET votes = votes - OLD.vote
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_votes ON post_votes;
CREATE TRIGGER trigger_update_post_votes
  AFTER INSERT OR UPDATE OR DELETE ON post_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_votes();

-- Update reply votes trigger
CREATE OR REPLACE FUNCTION update_reply_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_replies
    SET votes = votes + NEW.vote
    WHERE id = NEW.reply_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE forum_replies
    SET votes = votes + (NEW.vote - OLD.vote)
    WHERE id = NEW.reply_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_replies
    SET votes = votes - OLD.vote
    WHERE id = OLD.reply_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_reply_votes ON reply_votes;
CREATE TRIGGER trigger_update_reply_votes
  AFTER INSERT OR UPDATE OR DELETE ON reply_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_reply_votes();

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_forum_posts_updated_at ON forum_posts;
CREATE TRIGGER trigger_update_forum_posts_updated_at
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_forum_replies_updated_at ON forum_replies;
CREATE TRIGGER trigger_update_forum_replies_updated_at
  BEFORE UPDATE ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_templates_updated_at ON templates;
CREATE TRIGGER trigger_update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
`;

/**
 * Export all SQL
 */
export const getFullSQL = () => {
  return `
${COMMUNITY_SCHEMA}

${SEED_BADGES}

${SEED_CATEGORIES}

${DB_FUNCTIONS}
`;
};
