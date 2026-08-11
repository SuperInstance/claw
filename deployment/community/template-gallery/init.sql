-- Template Gallery Database Initialization Script
-- Creates all tables, indexes, and initial data

-- ========================================================================
-- Extensions
-- ========================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search

-- ========================================================================
-- Users & Authentication
-- ========================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discourse_user_id INTEGER UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_discourse_id ON users(discourse_user_id);
CREATE INDEX idx_users_username ON users(username);

-- ========================================================================
-- User Profiles
-- ========================================================================

CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    github_username VARCHAR(100),
    linkedin_url TEXT,
    expertise_level VARCHAR(20) CHECK (expertise_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    industry VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================================
-- User Statistics
-- ========================================================================

CREATE TABLE user_statistics (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    templates_shared INTEGER DEFAULT 0,
    templates_downloaded INTEGER DEFAULT 0,
    reviews_written INTEGER DEFAULT 0,
    helpful_votes_received INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 0,
    rank VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_statistics_reputation ON user_statistics(reputation_score DESC);

-- ========================================================================
-- Badges & Achievements
-- ========================================================================

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    rarity VARCHAR(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) NOT NULL,
    requirement_type VARCHAR(50),
    requirement_value INTEGER,
    reputation_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);

-- ========================================================================
-- Template Categories
-- ========================================================================

CREATE TABLE template_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    parent_id UUID REFERENCES template_categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_template_categories_slug ON template_categories(slug);
CREATE INDEX idx_template_categories_parent ON template_categories(parent_id);

-- ========================================================================
-- Tags
-- ========================================================================

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_usage ON tags(usage_count DESC);

-- ========================================================================
-- Templates
-- ========================================================================

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    long_description TEXT,
    category_id UUID REFERENCES template_categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Template Files
    file_url TEXT NOT NULL,
    file_size INTEGER,
    screenshot_url TEXT,

    -- Versioning
    version VARCHAR(20) DEFAULT '1.0.0',
    changelog TEXT,

    -- Licensing
    license_type VARCHAR(20) CHECK (license_type IN ('MIT', 'Apache-2.0', 'GPL-3.0', 'CC-BY-4.0', 'CC0', 'proprietary')) DEFAULT 'MIT',

    -- Status
    status VARCHAR(20) CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'archived')) DEFAULT 'pending_review',
    featured BOOLEAN DEFAULT FALSE,
    official BOOLEAN DEFAULT FALSE,

    -- Statistics
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    fork_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    rating_count INTEGER DEFAULT 0,

    -- Sharing Options
    allow_comments BOOLEAN DEFAULT TRUE,
    allow_rating BOOLEAN DEFAULT TRUE,
    allow_forks BOOLEAN DEFAULT TRUE,

    -- Moderation
    flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    last_downloaded_at TIMESTAMP WITH TIME ZONE,

    -- Search
    search_vector tsvector
);

CREATE INDEX idx_templates_slug ON templates(slug);
CREATE INDEX idx_templates_category ON templates(category_id);
CREATE INDEX idx_templates_author ON templates(author_id);
CREATE INDEX idx_templates_status ON templates(status);
CREATE INDEX idx_templates_featured ON templates(featured) WHERE featured = TRUE;
CREATE INDEX idx_templates_rating ON templates(average_rating DESC, rating_count DESC);
CREATE INDEX idx_templates_downloads ON templates(download_count DESC);
CREATE INDEX idx_templates_created ON templates(created_at DESC);
CREATE INDEX idx_templates_search ON templates USING GIN(search_vector);

-- ========================================================================
-- Template Tags (Many-to-Many)
-- ========================================================================

CREATE TABLE template_tags (
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, tag_id)
);

CREATE INDEX idx_template_tags_template ON template_tags(template_id);
CREATE INDEX idx_template_tags_tag ON template_tags(tag_id);

-- ========================================================================
-- Template Reviews
-- ========================================================================

CREATE TABLE template_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,

    -- Moderation
    flagged BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(template_id, user_id)
);

CREATE INDEX idx_template_reviews_template ON template_reviews(template_id);
CREATE INDEX idx_template_reviews_user ON template_reviews(user_id);
CREATE INDEX idx_template_reviews_rating ON template_reviews(rating);

-- ========================================================================
-- Review Helpful Votes
-- ========================================================================

CREATE TABLE review_votes (
    review_id UUID REFERENCES template_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (review_id, user_id)
);

-- ========================================================================
-- Template Downloads
-- ========================================================================

CREATE TABLE template_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_template_downloads_template ON template_downloads(template_id);
CREATE INDEX idx_template_downloads_user ON template_downloads(user_id);
CREATE INDEX idx_template_downloads_created ON template_downloads(created_at DESC);

-- ========================================================================
-- Template Forks
-- ========================================================================

CREATE TABLE template_forks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    forked_template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(original_template_id, forked_template_id, user_id)
);

CREATE INDEX idx_template_forks_original ON template_forks(original_template_id);
CREATE INDEX idx_template_forks_forked ON template_forks(forked_template_id);
CREATE INDEX idx_template_forks_user ON template_forks(user_id);

-- ========================================================================
-- Activity Feed
-- ========================================================================

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    content_type VARCHAR(50),
    content_id UUID,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_user ON activities(user_id, created_at DESC);
CREATE INDEX idx_activities_type ON activities(activity_type, created_at DESC);
CREATE INDEX idx_activities_content ON activities(content_type, content_id);

-- ========================================================================
-- Notifications
-- ========================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    action_url TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(user_id, read) WHERE read = FALSE;

-- ========================================================================
-- Moderation Queue
-- ========================================================================

CREATE TABLE moderation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(50) NOT NULL,
    content_id UUID NOT NULL,
    reason TEXT,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status VARCHAR(20) CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_moderation_queue_status ON moderation_queue(status, priority);
CREATE INDEX idx_moderation_queue_assigned ON moderation_queue(assigned_to);

-- ========================================================================
-- Leaderboard (Materialized View)
-- ========================================================================

CREATE MATERIALIZED VIEW leaderboard AS
SELECT
    u.id AS user_id,
    u.username,
    u.avatar_url,
    COALESCE(us.reputation_score, 0) AS reputation_score,
    COALESCE(us.templates_shared, 0) AS templates_shared,
    COALESCE(us.reviews_written, 0) AS reviews_written,
    COALESCE(us.helpful_votes_received, 0) AS helpful_votes,
    COUNT(DISTINCT ub.badge_id) AS badge_count
FROM users u
LEFT JOIN user_statistics us ON u.id = us.user_id
LEFT JOIN user_badges ub ON u.id = ub.user_id
GROUP BY u.id, u.username, u.avatar_url, us.reputation_score, us.templates_shared, us.reviews_written, us.helpful_votes_received
ORDER BY reputation_score DESC;

CREATE UNIQUE INDEX idx_leaderboard_user ON leaderboard(user_id);

-- ========================================================================
-- Functions and Triggers
-- ========================================================================

-- Update search vector
CREATE OR REPLACE FUNCTION update_template_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.long_description, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER template_search_update
    BEFORE INSERT OR UPDATE OF title, description, long_description
    ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_template_search_vector();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_reviews_updated_at BEFORE UPDATE ON template_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================================================
-- Initial Data - Categories
-- ========================================================================

INSERT INTO template_categories (name, slug, description, icon, sort_order) VALUES
('Finance', 'finance', 'Financial templates, budgeting, forecasting, and analysis', 'dollar-sign', 1),
('Data Analysis', 'data-analysis', 'Data processing, analysis, and visualization templates', 'chart-line', 2),
('Project Management', 'project-management', 'Project tracking, planning, and management templates', 'tasks', 3),
('Sales & Marketing', 'sales-marketing', 'Sales tracking, marketing analytics, and CRM templates', 'trending-up', 4),
('Operations', 'operations', 'Operational efficiency, inventory, and logistics templates', 'cog', 5),
('Education', 'education', 'Educational tools, grading, and learning templates', 'graduation-cap', 6),
('Healthcare', 'healthcare', 'Medical, healthcare, and wellness templates', 'heartbeat', 7),
('Real Estate', 'real-estate', 'Property management, real estate analysis templates', 'home', 8),
('HR & Recruiting', 'hr-recruiting', 'Human resources and recruitment templates', 'users', 9),
('Utilities', 'utilities', 'Utility templates, calculators, and helpers', 'wrench', 10);

-- ========================================================================
-- Initial Data - Badges
-- ========================================================================

INSERT INTO badges (name, description, rarity, requirement_type, requirement_value, reputation_reward) VALUES
-- Common Badges
('First Template', 'Shared your first template', 'common', 'templates_shared', 1, 10),
('First Review', 'Wrote your first template review', 'common', 'reviews_written', 1, 5),
('Explorer', 'Downloaded your first template', 'common', 'templates_downloaded', 1, 2),
('Helper', 'Had your review marked as helpful', 'common', 'helpful_votes_received', 1, 3),

-- Rare Badges
('Template Author', 'Shared 5 templates', 'rare', 'templates_shared', 5, 50),
('Reviewer', 'Wrote 10 reviews', 'rare', 'reviews_written', 10, 25),
('Helpful Contributor', 'Received 10 helpful votes', 'rare', 'helpful_votes_received', 10, 30),
('Downloader', 'Downloaded 25 templates', 'rare', 'templates_downloaded', 25, 15),

-- Epic Badges
('Template Master', 'Shared 25 templates', 'epic', 'templates_shared', 25, 150),
('Expert Reviewer', 'Wrote 50 reviews', 'epic', 'reviews_written', 50, 100),
('Community Star', 'Received 50 helpful votes', 'epic', 'helpful_votes_received', 50, 125),
('Power User', 'Downloaded 100 templates', 'epic', 'templates_downloaded', 100, 50),

-- Legendary Badges
('Template Legend', 'Shared 100 templates', 'legendary', 'templates_shared', 100, 500),
('Elite Reviewer', 'Wrote 250 reviews', 'legendary', 'reviews_written', 250, 300),
('Community Icon', 'Received 200 helpful votes', 'legendary', 'helpful_votes_received', 200, 400),
('Super User', 'Downloaded 500 templates', 'legendary', 'templates_downloaded', 500, 200);

-- ========================================================================
-- Initial Data - Tags
-- ========================================================================

INSERT INTO tags (name, description) VALUES
('budgeting', 'Budget planning and tracking'),
('forecasting', 'Predictive modeling and forecasting'),
('dashboard', 'Dashboard and visualization templates'),
('automation', 'Automated workflow templates'),
('calculator', 'Calculation and utility templates'),
('reporting', 'Report generation templates'),
('tracking', 'Tracking and monitoring templates'),
('analysis', 'Data analysis templates'),
('planning', 'Planning and strategy templates'),
('inventory', 'Inventory management'),
('finance', 'Financial calculations'),
('sales', 'Sales tracking and analysis'),
('marketing', 'Marketing analytics'),
('project', 'Project management'),
('hr', 'Human resources'),
('education', 'Educational tools'),
('healthcare', 'Medical and health'),
('real-estate', 'Real estate and property'),
('beginner', 'Beginner-friendly templates'),
('advanced', 'Advanced templates'),
('free', 'Free templates'),
('premium', 'Premium templates');

-- ========================================================================
-- Grant Permissions
-- ========================================================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO template_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO template_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO template_user;

-- ========================================================================
-- Complete
-- ========================================================================

-- Refresh materialized view
REFRESH MATERIALIZED VIEW leaderboard;

COMMIT;
