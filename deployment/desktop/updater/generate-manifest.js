#!/usr/bin/env node

/**
 * Generate Update Manifest
 *
 * This script generates update manifests from built packages.
 * Usage: node updater/generate-manifest.js <version>
 */

const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const VERSION = process.argv[2];
const BASE_URL = 'https://updates.superinstance.ai/spreadsheet-moment';
const PACKAGES_DIR = path.join(__dirname, '../src-tauri/target/release/bundle');

if (!VERSION) {
  console.error('Usage: node generate-manifest.js <version>');
  process.exit(1);
}

async function generateManifest() {
  const manifest = {
    version: VERSION,
    notes: `Spreadsheet Moment v${VERSION}`,
    pub_date: new Date().toISOString(),
    platforms: {},
  };

  // Windows
  const windowsPath = path.join(PACKAGES_DIR, 'nsis');
  try {
    const files = await fs.readdir(windowsPath);
    const installer = files.find((f) => f.endsWith('.exe'));
    if (installer) {
      manifest.platforms['windows-x86_64'] = {
        signature: crypto
          .createHash('sha256')
          .update(installer)
          .digest('base64'),
        url: `${BASE_URL}/v${VERSION}/windows/${installer}`,
      };
    }
  } catch (error) {
    console.log('No Windows package found');
  }

  // macOS
  const macosPath = path.join(PACKAGES_DIR, 'dmg');
  try {
    const files = await fs.readdir(macosPath);
    const dmg = files.find((f) => f.endsWith('.dmg'));
    if (dmg) {
      manifest.platforms['darwin-x86_64'] = {
        signature: crypto.createHash('sha256').update(dmg).digest('base64'),
        url: `${BASE_URL}/v${VERSION}/macos/${dmg}`,
      };
    }
  } catch (error) {
    console.log('No macOS package found');
  }

  // Linux
  const linuxPath = path.join(PACKAGES_DIR, 'deb');
  try {
    const files = await fs.readdir(linuxPath);
    const deb = files.find((f) => f.endsWith('.deb'));
    if (deb) {
      manifest.platforms['linux-x86_64'] = {
        signature: crypto.createHash('sha256').update(deb).digest('base64'),
        url: `${BASE_URL}/v${VERSION}/linux/${deb}`,
      };
    }
  } catch (error) {
    console.log('No Linux package found');
  }

  // Write manifest
  const versionDir = path.join(__dirname, 'packages', `v${VERSION}`);
  await fs.mkdir(versionDir, { recursive: true });

  const manifestPath = path.join(versionDir, 'latest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`Generated manifest for v${VERSION}:`);
  console.log(Object.keys(manifest.platforms));
  console.log(`\nManifest saved to: ${manifestPath}`);
}

generateManifest().catch(console.error);
