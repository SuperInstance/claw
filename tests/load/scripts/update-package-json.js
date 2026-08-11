#!/usr/bin/env node

/**
 * Add load testing scripts to package.json
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add load testing scripts
const loadTestScripts = {
  'test:load': 'bash tests/load/scripts/run-load-tests.sh all',
  'test:load:baseline': 'bash tests/load/scripts/run-load-tests.sh baseline',
  'test:load:rampup': 'bash tests/load/scripts/run-load-tests.sh rampup',
  'test:load:sustained': 'bash tests/load/scripts/run-load-tests.sh sustained',
  'test:load:spike': 'bash tests/load/scripts/run-load-tests.sh spike',
  'test:load:stress': 'bash tests/load/scripts/run-load-tests.sh stress',
  'test:load:websocket': 'bash tests/load/scripts/run-load-tests.sh websocket',
  'test:load:generate': 'node tests/load/scripts/generate-users.js && node tests/load/scripts/generate-spreadsheets.js',
  'test:load:monitoring': 'cd tests/load && docker-compose up -d prometheus grafana',
  'test:load:monitoring:stop': 'cd tests/load && docker-compose down',
  'test:load:grafana': 'echo "Opening Grafana at http://localhost:3000 (admin/admin)"',
  'test:load:report': 'node tests/load/scripts/generate-summary-report.js',
};

// Windows-specific scripts
const loadTestScriptsWin = {
  'test:load:win': 'pwsh -File tests/load/scripts/run-load-tests.ps1 -TestType all',
  'test:load:baseline:win': 'pwsh -File tests/load/scripts/run-load-tests.ps1 -TestType baseline',
  'test:load:rampup:win': 'pwsh -File tests/load/scripts/run-load-tests.ps1 -TestType rampup',
  'test:load:sustained:win': 'pwsh -File tests/load/scripts/run-load-tests.ps1 -TestType sustained',
  'test:load:spike:win': 'pwsh -File tests/load/scripts/run-load-tests.ps1 -TestType spike',
  'test:load:stress:win': 'pwsh -File tests/load/scripts/run-load-tests.ps1 -TestType stress',
  'test:load:websocket:win': 'pwsh -File tests/load/scripts/run-load-tests.ps1 -TestType websocket',
};

// Merge scripts
Object.assign(packageJson.scripts, loadTestScripts);
Object.assign(packageJson.scripts, loadTestScriptsWin);

// Add dev dependencies if not present
const devDependencies = {
  '@types/k6': '^0.47.0',
  'k6': '^0.47.0',
  'artillery': '^2.0.0',
};

if (!packageJson.devDependencies) {
  packageJson.devDependencies = {};
}

Object.assign(packageJson.devDependencies, devDependencies);

// Write back
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('✓ Added load testing scripts to package.json');
console.log('✓ Added dev dependencies for load testing');
console.log('');
console.log('Available commands:');
console.log('  npm run test:load                - Run all load tests');
console.log('  npm run test:load:baseline       - Run baseline test (100 users)');
console.log('  npm run test:load:rampup         - Run ramp-up test (100→10,000 users)');
console.log('  npm run test:load:sustained      - Run sustained load test (5,000 users, 1 hour)');
console.log('  npm run test:load:spike          - Run spike test (1,000→10,000 in 1 minute)');
console.log('  npm run test:load:stress         - Run stress test (beyond 10,000 users)');
console.log('  npm run test:load:websocket      - Run WebSocket tests');
console.log('  npm run test:load:generate       - Generate test data');
console.log('  npm run test:load:monitoring     - Start monitoring infrastructure');
console.log('  npm run test:load:monitoring:stop- Stop monitoring infrastructure');
console.log('');
console.log('Windows commands (use :win suffix):');
console.log('  npm run test:load:win');
console.log('  npm run test:load:baseline:win');
console.log('  ...');
