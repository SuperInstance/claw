#!/usr/bin/env ruby
# Discourse Categories and Permissions Setup Script
# Run this script within the Discourse rails console

# Enable all plugins
Plugin::Registry.all.each(&:enable_plugin!)

# ========================================================================
# Create Category Structure
# ========================================================================

puts "Creating Discourse category structure..."

# ========================================================================
# Main Categories
# ========================================================================

# 1. General Category
general = Category.find_by(slug: 'general') || Category.create!(
  name: 'General',
  slug: 'general',
  description: 'General discussions about SuperInstance, announcements, and community news',
  color: '0088CC',
  text_color: 'FFFFFF',
  position: 1,
  permissions: {
    everyone: 1 # Full access
  }
)

# Create welcome topic in General
Post.create!(
  topic_id: Topic.create!(
    title: 'Welcome to the SuperInstance Community!',
    user: User.find_by_username('system'),
    category: general
  ).id,
  raw: File.read('welcome_topic.md'),
  user: User.find_by_username('system')
)

# 2. Help & Support Category
help_support = Category.create!(
  name: 'Help & Support',
  slug: 'help-support',
  description: 'Get help with SuperInstance, ask questions, and find solutions',
  color: 'E45735',
  text_color: 'FFFFFF',
  position: 2,
  permissions: {
    everyone: 1 # Full access
  }
)

# Help Subcategories
help_subcategories = [
  {
    name: 'Beginners',
    slug: 'beginners',
    description: 'Questions and help for those new to SuperInstance'
  },
  {
    name: 'Installation & Setup',
    slug: 'installation-setup',
    description: 'Help with installing and configuring SuperInstance'
  },
  {
    name: 'Formulas & Functions',
    slug: 'formulas-functions',
    description: 'Questions about formulas, functions, and calculations'
  },
  {
    name: 'Troubleshooting',
    slug: 'troubleshooting',
    description: 'Debugging and problem-solving'
  }
]

help_subcategories.each do |sub|
  Category.create!(
    name: sub[:name],
    slug: sub[:slug],
    description: sub[:description],
    parent_category: help_support,
    color: 'E45735',
    text_color: 'FFFFFF',
    permissions: { everyone: 1 }
  )
end

# 3. Showcase Category
showcase = Category.create!(
  name: 'Showcase',
  slug: 'showcase',
  description: 'Share your projects, templates, and creative uses of SuperInstance',
  color: 'FCC04D',
  text_color: 'FFFFFF',
  position: 3,
  permissions: {
    everyone: 1 # Full access
  }
)

# Showcase Subcategories
showcase_subcategories = [
  {
    name: 'Template Gallery',
    slug: 'template-gallery',
    description: 'Share and browse community-created templates'
  },
  {
    name: 'Success Stories',
    slug: 'success-stories',
    description: 'Share how SuperInstance helped you achieve your goals'
  },
  {
    name: 'Innovations',
    slug: 'innovations',
    description: 'Showcase novel and creative uses of SuperInstance'
  }
]

showcase_subcategories.each do |sub|
  Category.create!(
    name: sub[:name],
    slug: sub[:slug],
    description: sub[:description],
    parent_category: showcase,
    color: 'FCC04D',
    text_color: 'FFFFFF',
    permissions: { everyone: 1 }
  )
end

# 4. Development Category
development = Category.create!(
  name: 'Development',
  slug: 'development',
  description: 'Development discussions, contributions, and technical deep-dives',
  color: '4CBB17',
  text_color: 'FFFFFF',
  position: 4,
  permissions: {
    everyone: 1 # Full access
  }
)

# Development Subcategories
development_subcategories = [
  {
    name: 'Contributions',
    slug: 'contributions',
    description: 'Discuss contributions and pull requests'
  },
  {
    name: 'Feature Requests',
    slug: 'feature-requests',
    description: 'Propose and discuss new features'
  },
  {
    name: 'Bug Reports',
    slug: 'bug-reports',
    description: 'Report and track bugs'
  },
  {
    name: 'Architecture',
    slug: 'architecture',
    description: 'Technical discussions about SuperInstance architecture'
  }
]

development_subcategories.each do |sub|
  Category.create!(
    name: sub[:name],
    slug: sub[:slug],
    description: sub[:description],
    parent_category: development,
    color: '4CBB17',
    text_color: 'FFFFFF',
    permissions: { everyone: 1 }
  )
end

# 5. Learning & Tutorials Category
learning = Category.create!(
  name: 'Learning & Tutorials',
  slug: 'learning-tutorials',
  description: 'Educational content, tutorials, and learning resources',
  color: '9368E9',
  text_color: 'FFFFFF',
  position: 5,
  permissions: {
    everyone: 1 # Full access
  }
)

# Learning Subcategories
learning_subcategories = [
  {
    name: 'Tutorials',
    slug: 'tutorials',
    description: 'Step-by-step tutorials and guides'
  },
  {
    name: 'Video Courses',
    slug: 'video-courses',
    description: 'Video tutorials and course content'
  },
  {
    name: 'Documentation',
    slug: 'documentation',
    description: 'Documentation improvements and discussions'
  },
  {
    name: 'Examples',
    slug: 'examples',
    description: 'Example implementations and use cases'
  }
]

learning_subcategories.each do |sub|
  Category.create!(
    name: sub[:name],
    slug: sub[:slug],
    description: sub[:description],
    parent_category: learning,
    color: '9368E9',
    text_color: 'FFFFFF',
    permissions: { everyone: 1 }
  )
end

# 6. Community Category
community = Category.create!(
  name: 'Community',
  slug: 'community',
  description: 'Community events, feedback, and meta-discussions',
  color: 'FF6B6B',
  text_color: 'FFFFFF',
  position: 6,
  permissions: {
    everyone: 1 # Full access
  }
)

# Community Subcategories
community_subcategories = [
  {
    name: 'Events',
    slug: 'events',
    description: 'Community events, webinars, and meetups'
  },
  {
    name: 'Feedback',
    slug: 'feedback',
    description: 'Provide feedback on the community and platform'
  },
  {
    name: 'Off-Topic',
    slug: 'off-topic',
    description: 'Casual discussions not related to SuperInstance'
  }
]

community_subcategories.each do |sub|
  Category.create!(
    name: sub[:name],
    slug: sub[:slug],
    description: sub[:description],
    parent_category: community,
    color: 'FF6B6B',
    text_color: 'FFFFFF',
    permissions: { everyone: 1 }
  )
end

# 7. Restricted: Staff Category (Staff Only)
staff_category = Category.create!(
  name: 'Staff',
  slug: 'staff',
  description: 'Internal staff discussions and announcements',
  color: '808080',
  text_color: 'FFFFFF',
  position: 0,
  permissions: {
    staff: 1,     # Full access for staff
    everyone: 0   # No access for regular users
  },
  read_only: true
)

# ========================================================================
# Create Tags
# ========================================================================

puts "Creating Discourse tags..."

tags = [
  'beginner', 'intermediate', 'advanced',
  'tutorial', 'help', 'showcase',
  'bug', 'feature-request', 'discussion',
  'ai', 'formulas', 'templates',
  'installation', 'configuration',
  'performance', 'optimization',
  'integration', 'api',
  'documentation', 'examples',
  'video', 'webinar', 'event'
]

tags.each do |tag_name|
  Tag.find_by_name(tag_name) || Tag.create!(name: tag_name)
end

# ========================================================================
# Create Badge System
# ========================================================================

puts "Creating Discourse badges..."

# Basic Badges
badges = [
  {
    name: 'First Post',
    description: 'Created your first post',
    badge_type: 'bronze',
    query: 'SELECT user_id FROM posts WHERE post_number = 1'
  },
  {
    name: 'Welcome',
    description: 'Liked a post',
    badge_type: 'bronze',
    query: 'SELECT DISTINCT g.user_id FROM user_actions AS g, posts AS p WHERE g.post_id = p.id AND g.action_type = 1'
  },
  {
    name: 'Reader',
    description: 'Read over 100 posts',
    badge_type: 'bronze',
    query: 'SELECT user_id FROM user_stats WHERE posts_read_count >= 100'
  },
  {
    name: 'Helper',
    description: 'Replied to 10 different topics',
    badge_type: 'bronze',
    query: 'SELECT p.user_id FROM posts p JOIN topics t ON p.topic_id = t.id WHERE p.post_number > 1 GROUP BY p.user_id HAVING COUNT(DISTINCT p.topic_id) >= 10'
  },
  {
    name: 'Respected Member',
    description: 'Received 100 likes',
    badge_type: 'silver',
    query: 'SELECT user_id FROM user_stats WHERE like_received >= 100'
  },
  {
    name: 'Contributor',
    description: 'Created 50 posts',
    badge_type: 'silver',
    query: 'SELECT user_id FROM user_stats WHERE post_count >= 50'
  },
  {
    name: 'Good Answer',
    description: 'Received 20 likes on a single post',
    badge_type: 'silver',
    query: 'SELECT p.user_id FROM posts p JOIN posts pa ON p.id = pa.id WHERE pa.like_count >= 20'
  },
  {
    name: 'Prolific Poster',
    description: 'Created 200 posts',
    badge_type: 'gold',
    query: 'SELECT user_id FROM user_stats WHERE post_count >= 200'
  },
  {
    name: 'Community Leader',
    description: 'Received 500 likes',
    badge_type: 'gold',
    query: 'SELECT user_id FROM user_stats WHERE like_received >= 500'
  },
  {
    name: 'Enlightened',
    description: 'Received 50 likes on a single answer',
    badge_type: 'gold',
    query: 'SELECT p.user_id FROM posts p JOIN posts pa ON p.id = pa.id WHERE pa.like_count >= 50'
  }
]

badges.each do |badge_config|
  Badge.find_by_name(badge_config[:name]) || Badge.create!(
    name: badge_config[:name],
    description: badge_config[:description],
    badge_type_id: BadgeType.where(name: badge_config[:badge_type]).first.id,
    query: badge_config[:query],
    auto_revoke: false,
    enabled: true
  )
end

# ========================================================================
# Configure User Fields
# ========================================================================

puts "Creating Discourse user fields..."

user_fields = [
  {
    name: 'Expertise',
    field_type: 'dropdown',
    description: 'Your area of expertise',
    options: 'Beginner\nIntermediate\nAdvanced\nExpert',
    required: false
  },
  {
    name: 'Industry',
    field_type: 'dropdown',
    description: 'Your industry',
    options: 'Finance\nHealthcare\nEducation\nTechnology\nManufacturing\nRetail\nOther',
    required: false
  },
  {
    name: 'Location',
    field_type: 'text',
    description: 'Your location (city, country)',
    required: false
  },
  {
    name: 'Website',
    field_type: 'text',
    description: 'Your website or portfolio',
    required: false
  },
  {
    name: 'GitHub',
    field_type: 'text',
    description: 'Your GitHub username',
    required: false
  },
  {
    name: 'LinkedIn',
    field_type: 'text',
    description: 'Your LinkedIn profile',
    required: false
  }
]

user_fields.each do |field_config|
  UserField.find_by_name(field_config[:name]) || UserField.create!(field_config)
end

# ========================================================================
# Configure Site Settings
# ========================================================================

puts "Configuring Discourse site settings..."

# Enable features
SiteSetting.enabled_plugins = 'discourse-solved|discourse-assign|discourse-gamification|discourse-signatures|discourse-calendar|discourse-data-explorer'
SiteSetting.solved_enabled = true
SiteSetting.assign_enabled = true
SiteSetting.gamification_enabled = true

# Trust levels
SiteSetting.minimum_trust_level_to_post_links = 0
SiteSetting.minimum_trust_level_to_embed_topic_list = 0
SiteSetting.minimum_trust_level_to_create_topic = 0
SiteSetting.minimum_trust_level_to_reply_as_new_topic = 0

# Rate limiting
SiteSetting.rate_limit_create_topic = 5
SiteSetting.rate_limit_create_post = 5
SiteSetting.max_likes_per_day = 50
SiteSetting.max_edits_per_day = 30

# Authentication
SiteSetting.enable_local_logins = true
SiteSetting.enable_discourse_connect = false
SiteSetting.allow_new_registrations = true
SiteSetting.invite_only = false

# Email
SiteSetting.notification_email = 'noreply@superinstance.ai'
SiteSetting.manual_polling_enabled = false

# Content
SiteSetting.max_image_size_kb = 5120
SiteSetting.max_attachment_size_kb = 10240
SiteSetting.max_post_length = 28000

# Security
SiteSetting.email_domains_blacklist = 'mailinator.com,guerrillamail.com,10minutemail.com'
SiteSetting.duplicate_link_ratio = 0.5

puts "Discourse categories and permissions setup complete!"
