#!/usr/bin/env node

/**
 * Generate test user data for load testing
 * Creates realistic user profiles with authentication tokens
 */

const fs = require('fs');
const path = require('path');

const USER_COUNT = 10000;
const OUTPUT_FILE = path.join(__dirname, '../data/test-users.json');

function generateUsers() {
  console.log(`Generating ${USER_COUNT} test users...`);

  const users = [];
  const roles = ['viewer', 'editor', 'owner', 'admin'];
  const organizations = [
    'Acme Corp',
    'Globex Inc',
    'Soylent Corp',
    'Initech',
    'Umbrella Corp',
    'Stark Industries',
    'Wayne Enterprises',
    'Cyberdyne Systems',
  ];

  for (let i = 1; i <= USER_COUNT; i++) {
    const user = {
      id: `user-${i}`,
      email: `testuser${i}@example.com`,
      name: `Test User ${i}`,
      role: roles[Math.floor(Math.random() * roles.length)],
      organization: organizations[Math.floor(Math.random() * organizations.length)],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      token: generateToken(i),
      preferences: {
        theme: Math.random() > 0.5 ? 'light' : 'dark',
        notifications: Math.random() > 0.3,
        autosave: true,
        language: ['en', 'es', 'fr', 'de', 'ja', 'zh'][Math.floor(Math.random() * 6)],
      },
      stats: {
        spreadsheetsCreated: Math.floor(Math.random() * 50),
        spreadsheetsViewed: Math.floor(Math.random() * 500),
        totalEdits: Math.floor(Math.random() * 5000),
      },
    };

    users.push(user);

    if (i % 1000 === 0) {
      console.log(`Generated ${i} users...`);
    }
  }

  // Ensure data directory exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(users, null, 2));
  console.log(`✓ Generated ${USER_COUNT} test users`);
  console.log(`✓ Saved to ${OUTPUT_FILE}`);
}

function generateToken(userId) {
  const crypto = require('crypto');
  return `test-token-${userId}-${crypto.randomBytes(32).toString('hex')}`;
}

// Run if called directly
if (require.main === module) {
  generateUsers();
}

module.exports = { generateUsers };
