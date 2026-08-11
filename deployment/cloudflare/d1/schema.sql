-- Spreadsheet Moment - D1 Database Schema
-- MIT License - Copyright (c) 2026 SuperInstance Research Team
-- Cloudflare D1 (SQLite) Schema

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================================================
-- Users Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  password_hash TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  twitter TEXT,
  github TEXT,
  linkedin TEXT,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME,
  is_active INTEGER DEFAULT 1,
  email_verified INTEGER DEFAULT 0,
  two_factor_enabled INTEGER DEFAULT 0,
  two_factor_secret TEXT,
  reputation INTEGER DEFAULT 0
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_reputation ON users(reputation DESC);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ============================================================================
-- Sessions Table (for KV-backed sessions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================================
-- Spreadsheets Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS spreadsheets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL,
  thumbnail TEXT,
  is_template INTEGER DEFAULT 0,
  is_public INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at DATETIME,
  cells_count INTEGER DEFAULT 0,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_spreadsheets_owner_id ON spreadsheets(owner_id);
CREATE INDEX idx_spreadsheets_is_template ON spreadsheets(is_template);
CREATE INDEX idx_spreadsheets_is_public ON spreadsheets(is_public);
CREATE INDEX idx_spreadsheets_created_at ON spreadsheets(created_at DESC);
CREATE INDEX idx_spreadsheets_updated_at ON spreadsheets(updated_at DESC);

-- ============================================================================
-- Cells Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS cells (
  id TEXT PRIMARY KEY,
  spreadsheet_id TEXT NOT NULL,
  row INTEGER NOT NULL,
  column INTEGER NOT NULL,
  value TEXT,
  formula TEXT,
  type TEXT DEFAULT 'text' CHECK(type IN ('text', 'number', 'formula', 'date', 'boolean')),
  formatted TEXT,
  style JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spreadsheet_id) REFERENCES spreadsheets(id) ON DELETE CASCADE,
  UNIQUE(spreadsheet_id, row, column)
);

CREATE INDEX idx_cells_spreadsheet_id ON cells(spreadsheet_id);
CREATE INDEX idx_cells_row_column ON cells(spreadsheet_id, row, column);

-- ============================================================================
-- Collaborators Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS collaborators (
  id TEXT PRIMARY KEY,
  spreadsheet_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK(role IN ('owner', 'editor', 'viewer')),
  permissions JSON DEFAULT '["read"]',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spreadsheet_id) REFERENCES spreadsheets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(spreadsheet_id, user_id)
);

CREATE INDEX idx_collaborators_spreadsheet_id ON collaborators(spreadsheet_id);
CREATE INDEX idx_collaborators_user_id ON collaborators(user_id);

-- ============================================================================
-- Forum Posts Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS forum_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  category TEXT,
  tags JSON DEFAULT '[]',
  views INTEGER DEFAULT 0,
  votes INTEGER DEFAULT 0,
  pinned INTEGER DEFAULT 0,
  locked INTEGER DEFAULT 0,
  accepted_answer TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX idx_forum_posts_votes ON forum_posts(votes DESC);

-- ============================================================================
-- Forum Replies Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS forum_replies (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  accepted INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX idx_forum_replies_author_id ON forum_replies(author_id);
CREATE INDEX idx_forum_replies_created_at ON forum_replies(created_at ASC);

-- ============================================================================
-- Templates Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  category TEXT,
  author_id TEXT NOT NULL,
  spreadsheet_id TEXT NOT NULL,
  downloads INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  tags JSON DEFAULT '[]',
  featured INTEGER DEFAULT 0,
  approved INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (spreadsheet_id) REFERENCES spreadsheets(id) ON DELETE CASCADE
);

CREATE INDEX idx_templates_author_id ON templates(author_id);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_featured ON templates(featured);
CREATE INDEX idx_templates_downloads ON templates(downloads DESC);
CREATE INDEX idx_templates_rating ON templates(rating DESC);

-- ============================================================================
-- Template Reviews Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS template_reviews (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  review TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(template_id, user_id)
);

CREATE INDEX idx_template_reviews_template_id ON template_reviews(template_id);
CREATE INDEX idx_template_reviews_user_id ON template_reviews(user_id);

-- ============================================================================
-- Badges Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  rarity TEXT CHECK(rarity IN ('common', 'rare', 'epic', 'legendary'))
);

CREATE INDEX idx_badges_rarity ON badges(rarity);

-- ============================================================================
-- User Badges Table (Join Table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);

-- ============================================================================
-- Notifications Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT CHECK(type IN ('reply', 'mention', 'badge', 'warning', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSON,
  read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- Audit Log Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  changes JSON,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- Flags Table (for moderation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS flags (
  id TEXT PRIMARY KEY,
  content_type TEXT CHECK(content_type IN ('post', 'reply', 'template')),
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  flagged_by TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  moderator_note TEXT,
  reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (flagged_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_flags_content ON flags(content_type, content_id);
CREATE INDEX idx_flags_status ON flags(status);
CREATE INDEX idx_flags_created_at ON flags(created_at DESC);

-- ============================================================================
-- Warnings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS warnings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  warned_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (warned_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_warnings_user_id ON warnings(user_id);

-- ============================================================================
-- API Keys Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes JSON DEFAULT '[]',
  last_used_at DATETIME,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

-- ============================================================================
-- Webhooks Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events JSON DEFAULT '[]',
  secret TEXT,
  active INTEGER DEFAULT 1,
  last_triggered_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX idx_webhooks_active ON webhooks(active);

-- ============================================================================
-- Usage Metrics Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_metrics (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  spreadsheet_id TEXT,
  metric_name TEXT NOT NULL,
  metric_value REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata JSON,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (spreadsheet_id) REFERENCES spreadsheets(id) ON DELETE SET NULL
);

CREATE INDEX idx_usage_metrics_user_id ON usage_metrics(user_id);
CREATE INDEX idx_usage_metrics_spreadsheet_id ON usage_metrics(spreadsheet_id);
CREATE INDEX idx_usage_metrics_metric_name ON usage_metrics(metric_name);
CREATE INDEX idx_usage_metrics_timestamp ON usage_metrics(timestamp DESC);

-- ============================================================================
-- Analytics Events Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSON,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- ============================================================================
-- Rate Limiting Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS rate_limits (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(identifier, endpoint, window_start)
);

CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier, endpoint, window_start);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_spreadsheets_timestamp
AFTER UPDATE ON spreadsheets
BEGIN
  UPDATE spreadsheets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_cells_timestamp
AFTER UPDATE ON cells
BEGIN
  UPDATE cells SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_forum_posts_timestamp
AFTER UPDATE ON forum_posts
BEGIN
  UPDATE forum_posts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_forum_replies_timestamp
AFTER UPDATE ON forum_replies
BEGIN
  UPDATE forum_replies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_templates_timestamp
AFTER UPDATE ON templates
BEGIN
  UPDATE templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================================================
-- Seed Data
-- ============================================================================

-- Default badges
INSERT OR IGNORE INTO badges (id, name, description, icon, rarity) VALUES
  ('first_post', 'First Steps', 'Created your first post', '📝', 'common'),
  ('prolific_poster', 'Prolific Poster', 'Created 100 posts', '✍️', 'epic'),
  ('respected_member', 'Respected Member', 'Reached 100 reputation', '⭐', 'rare'),
  ('community_leader', 'Community Leader', 'Reached 1,000 reputation', '👑', 'legendary'),
  ('template_creator', 'Template Creator', 'Published 10 templates', '📊', 'rare'),
  ('helpful_reply', 'Helpful Reply', 'Received 10 upvotes on replies', '🤝', 'common'),
  ('problem_solver', 'Problem Solver', 'Had 5 answers accepted', '✅', 'rare'),
  ('early_adopter', 'Early Adopter', 'Joined in the first month', '🚀', 'legendary');

-- Default forum categories (stored as reference data)
-- Note: Categories are typically stored in a separate categories table in a full implementation
