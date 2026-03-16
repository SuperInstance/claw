#!/usr/bin/env node
/**
 * AST-Based Import Cleaner for Claw
 *
 * Automatically removes/fixes broken imports caused by
 * Day 11-12 simplification extension removal.
 *
 * Usage:
 *   node scripts/ast-import-cleaner.mjs           # Run in dry-run mode
 *   node scripts/ast-import-cleaner.mjs --write   # Write changes
 *   node scripts/ast-import-cleaner.mjs --help    # Show help
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = !args.includes('--write');
const VERBOSE = args.includes('--verbose');
const HELP = args.includes('--help') || args.includes('-h');

if (HELP) {
  console.log(`
AST Import Cleaner for Claw

Usage:
  node scripts/ast-import-cleaner.mjs [options]

Options:
  --write     Write changes to files (default: dry-run)
  --verbose   Show detailed progress
  --help, -h  Show this help message

Examples:
  # Dry run (preview changes)
  node scripts/ast-import-cleaner.mjs

  # Apply changes
  node scripts/ast-import-cleaner.mjs --write
`);
  process.exit(0);
}

// Extensions that still exist (from extensions/ directory)
const VALID_EXTENSIONS = new Set([
  'anthropic', 'brave', 'cloudflare-ai-gateway', 'discord', 'feishu',
  'google', 'huggingface', 'memory-core', 'mistral', 'nvidia',
  'ollama', 'openai', 'opencode', 'opencode-go', 'openrouter',
  'perplexity', 'shared', 'telegram', 'test-utils', 'together'
]);

// Broken import patterns
const BROKEN_PATTERNS = [
  // Extension imports for removed extensions
  {
    pattern: /extensions\/([^/'"]+)/,
    check: (match) => {
      const extName = match[1];
      return !VALID_EXTENSIONS.has(extName);
    },
    category: 'removed-extension'
  },
  // PI embedded helpers (file was removed)
  {
    pattern: /pi-embedded-helpers/,
    category: 'pi-embedded-helpers'
  },
  // Channels allow-from (file was removed)
  {
    pattern: /channels\/allow-from/,
    category: 'channels-missing'
  },
  // Channels normalize plugins (directory was removed)
  {
    pattern: /channels\/plugins\/normalize\//,
    category: 'channels-missing'
  },
  // Channels actions (some were removed)
  {
    pattern: /channels\/plugins\/actions\//,
    category: 'channels-missing'
  },
  // CLI files that were removed
  {
    pattern: /cli\/outbound-send-deps/,
    category: 'cli-missing'
  },
  {
    pattern: /cli\/memory-cli/,
    category: 'cli-missing'
  },
  // Line channel (not in extensions list)
  {
    pattern: /\/line\//,
    category: 'removed-channel'
  },
  // iMessage, Signal, WhatsApp, Slack removed
  {
    pattern: /extensions\/(imessage|signal|whatsapp|slack)\//,
    category: 'removed-messaging'
  }
];

// Statistics tracking
const stats = {
  filesScanned: 0,
  filesWithBrokenImports: 0,
  importsRemoved: 0,
  byCategory: {},
  changes: []
};

/**
 * Find all TypeScript files to process
 */
function findTypeScriptFiles() {
  const files = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', 'dist', '.git', 'test-fixtures'].includes(entry.name)) {
          walk(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        // Skip test files in dry-run
        files.push(fullPath);
      }
    }
  }

  walk(path.join(ROOT_DIR, 'src'));
  return files;
}

/**
 * Check if an import specifier matches any broken pattern
 */
function checkBrokenImport(specifier) {
  for (const { pattern, check, category } of BROKEN_PATTERNS) {
    const match = specifier.match(pattern);
    if (match) {
      if (check ? check(match) : true) {
        return { broken: true, category };
      }
    }
  }
  return { broken: false };
}

/**
 * Get identifiers from an import declaration
 */
function getIdentifiers(importNode, sourceFile) {
  const identifiers = [];

  if (importNode.importClause) {
    // Default import
    if (importNode.importClause.name) {
      identifiers.push({
        name: importNode.importClause.name.getText(sourceFile),
        type: 'default'
      });
    }

    // Named imports
    const bindings = importNode.importClause.namedBindings;
    if (bindings) {
      if (ts.isNamedImports(bindings)) {
        for (const element of bindings.elements) {
          identifiers.push({
            name: element.name.getText(sourceFile),
            type: 'named',
            propertyName: element.propertyName?.getText(sourceFile)
          });
        }
      } else if (ts.isNamespaceImport(bindings)) {
        identifiers.push({
          name: bindings.name.getText(sourceFile),
          type: 'namespace'
        });
      }
    }
  }

  return identifiers;
}

/**
 * Process a single TypeScript file
 */
function processFile(filePath) {
  stats.filesScanned++;

  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  const brokenImports = [];
  const identifiersToRemove = new Set();

  // Find all broken imports
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node)) {
      const specifier = node.moduleSpecifier.getText(sourceFile);
      const specifierText = specifier.replace(/['"]/g, '');

      const { broken, category } = checkBrokenImport(specifierText);
      if (broken) {
        const identifiers = getIdentifiers(node, sourceFile);
        brokenImports.push({
          node,
          specifier: specifierText,
          identifiers,
          category
        });

        // Track identifiers to remove
        for (const id of identifiers) {
          identifiersToRemove.add(id.name);
        }

        // Update stats
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      }
    }
  });

  if (brokenImports.length === 0) {
    return null;
  }

  stats.filesWithBrokenImports++;
  stats.importsRemoved += brokenImports.length;

  if (VERBOSE || DRY_RUN) {
    console.log(`\n${path.relative(ROOT_DIR, filePath)}`);
    for (const imp of brokenImports) {
      console.log(`  [${imp.category}] ${imp.specifier}`);
      if (VERBOSE) {
        for (const id of imp.identifiers) {
          console.log(`    - ${id.name}${id.propertyName ? ` (as ${id.propertyName})` : ''}`);
        }
      }
    }
  }

  if (!DRY_RUN) {
    // Transform the file to remove broken imports
    const result = transformFile(sourceFile, brokenImports);
    fs.writeFileSync(filePath, result);
    stats.changes.push({ file: filePath, imports: brokenImports });
  }

  return { file: filePath, imports: brokenImports };
}

/**
 * Transform source file to remove broken imports
 */
function transformFile(sourceFile, brokenImports) {
  const brokenSpecifiers = new Set(brokenImports.map(i => i.specifier));

  const transformer = (context) => {
    return (rootNode) => {
      function visit(node) {
        if (ts.isImportDeclaration(node)) {
          const specifier = node.moduleSpecifier.getText(sourceFile).replace(/['"]/g, '');
          if (brokenSpecifiers.has(specifier)) {
            // Skip this import (remove it)
            return undefined;
          }
        }
        return ts.visitEachChild(node, visit, context);
      }

      return ts.visitNode(rootNode, visit);
    };
  };

  const result = ts.transform(sourceFile, [transformer]);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  return printer.printNode(ts.EmitHint.Unspecified, result.transformed[0], sourceFile);
}

/**
 * Generate summary report
 */
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('AST Import Cleaner Summary');
  console.log('='.repeat(60));
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes made)' : 'LIVE (changes written)'}`);
  console.log(`Files scanned: ${stats.filesScanned}`);
  console.log(`Files with broken imports: ${stats.filesWithBrokenImports}`);
  console.log(`Total imports to remove: ${stats.importsRemoved}`);
  console.log('\nBy Category:');
  for (const [category, count] of Object.entries(stats.byCategory)) {
    console.log(`  ${category}: ${count}`);
  }

  if (DRY_RUN) {
    console.log('\n' + '-'.repeat(60));
    console.log('This was a dry run. To apply changes, run:');
    console.log('  node scripts/ast-import-cleaner.mjs --write');
  } else {
    // Write detailed report
    const reportPath = path.join(ROOT_DIR, 'ast-cleanup-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));
    console.log(`\nDetailed report written to: ${reportPath}`);
  }
}

/**
 * Main entry point
 */
function main() {
  console.log('AST Import Cleaner for Claw');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log('Scanning files...\n');

  const files = findTypeScriptFiles();
  console.log(`Found ${files.length} TypeScript files to scan\n`);

  for (const file of files) {
    processFile(file);
  }

  generateReport();
}

// Run
main();
