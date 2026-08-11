#!/usr/bin/env node

/**
 * Spreadsheet Moment - Update Server
 *
 * This script serves update manifests and packages for the auto-update system.
 * Run with: node updater/server.js
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const UPDATES_DIR = path.join(__dirname, 'packages');

// Middleware
app.use(express.json());
app.use(express.static(UPDATES_DIR));

// Generate signature for file (placeholder - real implementation uses private key)
function generateSignature(filePath) {
  return crypto.createHash('sha256').update(filePath).digest('base64');
}

// Get latest version
app.get('/latest.json', async (req, res) => {
  try {
    const platform = req.query.platform;
    const manifestPath = path.join(UPDATES_DIR, 'latest.json');

    let manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

    // Filter to requested platform if specified
    if (platform && manifest.platforms[platform]) {
      manifest.platforms = { [platform]: manifest.platforms[platform] };
    }

    res.json(manifest);
  } catch (error) {
    console.error('Error serving latest.json:', error);
    res.status(404).json({ error: 'Update manifest not found' });
  }
});

// Get version manifest
app.get('/v:version/latest.json', async (req, res) => {
  try {
    const { version } = req.params;
    const manifestPath = path.join(UPDATES_DIR, `v${version}`, 'latest.json');

    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    res.json(manifest);
  } catch (error) {
    console.error(`Error serving manifest for version ${req.params.version}:`, error);
    res.status(404).json({ error: 'Version not found' });
  }
});

// Download update package
app.get('/download/:platform/:version/:filename', async (req, res) => {
  try {
    const { platform, version, filename } = req.params;
    const filePath = path.join(UPDATES_DIR, `v${version}`, platform, filename);

    res.download(filePath);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(404).json({ error: 'File not found' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create update manifest helper
app.post('/create-manifest', async (req, res) => {
  try {
    const { version, notes, platforms } = req.body;

    const manifest = {
      version,
      notes,
      pub_date: new Date().toISOString(),
      platforms: {},
    };

    for (const [platform, files] of Object.entries(platforms)) {
      manifest.platforms[platform] = {
        signature: generateSignature(files.url),
        url: files.url,
      };
    }

    const versionDir = path.join(UPDATES_DIR, `v${version}`);
    await fs.mkdir(versionDir, { recursive: true });
    await fs.writeFile(
      path.join(versionDir, 'latest.json'),
      JSON.stringify(manifest, null, 2)
    );

    // Update latest.json
    await fs.writeFile(
      path.join(UPDATES_DIR, 'latest.json'),
      JSON.stringify(manifest, null, 2)
    );

    res.json({ success: true, manifest });
  } catch (error) {
    console.error('Error creating manifest:', error);
    res.status(500).json({ error: 'Failed to create manifest' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Update server running on port ${PORT}`);
  console.log(`Updates directory: ${UPDATES_DIR}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
