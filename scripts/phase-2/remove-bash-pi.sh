#!/bin/bash
# Remove bash execution and PI agent integration

set -e

cd "$(dirname "$0")/../.."

echo "========================================"
echo "Removing Bash Execution Files"
echo "========================================"

# Find and remove bash-related files
find src/agents/ -name "bash-*" -type f -delete
echo "Removed bash-* files"

# Find and remove PI agent files
find src/agents/ -name "pi-*" -type f -delete
echo "Removed pi-* files"

# Remove specific files
rm -f src/agents/cli-runner.ts
rm -f src/agents/claude-cli-runner.ts
rm -f src/agents/lanes.ts
echo "Removed CLI and lanes files"

# Remove auth-profiles directory (simplify to single profile)
rm -rf src/agents/auth-profiles/
echo "Removed auth-profiles directory"

echo "========================================"
echo "Bash and PI Agent Removal Complete!"
echo "========================================"
