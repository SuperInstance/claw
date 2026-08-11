#!/bin/bash
# Spreadsheet Moment - Initial Setup
# Sets up development environment

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BOLD}╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   Spreadsheet Moment - Setup        ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════╝${NC}"
echo ""

# Check system requirements
echo -e "${BOLD}[1/6]${NC} Checking system requirements..."

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "  ${GREEN}✓${NC} Node.js: $NODE_VERSION"

    # Check if version is 18+
    MAJOR_VERSION=$(echo "$NODE_VERSION" | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        echo -e "  ${YELLOW}⚠${NC} Node.js 18+ recommended (current: $NODE_VERSION)"
    fi
else
    echo -e "  ${RED}✗${NC} Node.js not found. Install from https://nodejs.org/"
    exit 1
fi

# npm
if command -v npm &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} npm: $(npm -v)"
else
    echo -e "  ${RED}✗${NC} npm not found"
    exit 1
fi

# Git
if command -v git &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} Git: $(git --version)"
else
    echo -e "  ${YELLOW}⚠${NC} Git not found. Install from https://git-scm.com/"
fi

echo ""

# Install dependencies
echo -e "${BOLD}[2/6]${NC} Installing dependencies..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Running npm install...${NC}"
    npm install
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${GREEN}✓${NC} Dependencies already installed"
fi
echo ""

# Create environment files
echo -e "${BOLD}[3/6]${NC} Setting up environment..."

# .env.local
if [ ! -f ".env.local" ]; then
    cat > .env.local <<EOF
# Spreadsheet Moment - Local Environment
# Generated on $(date)

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Spreadsheet Moment

# Database (if using)
# DATABASE_URL=postgresql://user:password@localhost:5432/spreadsheet_moment

# API Keys (if needed)
# NEXT_PUBLIC_API_KEY=your_api_key_here
EOF
    echo -e "${GREEN}✓${NC} Created .env.local"
else
    echo -e "${GREEN}✓${NC} .env.local already exists"
fi

# .env.example
if [ ! -f ".env.example" ]; then
    cat > .env.example <<EOF
# Spreadsheet Moment - Environment Variables Example

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Spreadsheet Moment

# Database
DATABASE_URL=

# API Keys
NEXT_PUBLIC_API_KEY=

# Feature Flags
NEXT_PUBLIC_FEATURE_X=false
EOF
    echo -e "${GREEN}✓${NC} Created .env.example"
fi
echo ""

# Create directories
echo -e "${BOLD}[4/6]${NC} Creating directories..."
DIRS=("logs" "backups" "reports" "metrics")
for dir in "${DIRS[@]}"; do
    mkdir -p "$dir"
    echo -e "  ${GREEN}✓${NC} Created: $dir/"
done

# Add .gitignore entries if not present
if [ -f ".gitignore" ]; then
    for dir in "${DIRS[@]}"; do
        if ! grep -q "^${dir}/" .gitignore; then
            echo "${dir}/" >> .gitignore
            echo -e "  ${GREEN}✓${NC} Added $dir/ to .gitignore"
        fi
    done
fi
echo ""

# Setup git hooks (if git repo)
if [ -d ".git" ]; then
    echo -e "${BOLD}[5/6]${NC} Setting up git hooks..."

    # Create hooks directory
    mkdir -p .git/hooks

    # Pre-commit hook
    cat > .git/hooks/pre-commit <<'EOF'
#!/bin/bash
# Pre-commit hook
echo "Running pre-commit checks..."

# Run lint-staged
npx lint-staged

# Run type check
npm run type-check

echo "Pre-commit checks passed!"
EOF
    chmod +x .git/hooks/pre-commit
    echo -e "  ${GREEN}✓${NC} Created pre-commit hook"

    # Pre-push hook
    cat > .git/hooks/pre-push <<'EOF'
#!/bin/bash
# Pre-push hook
echo "Running pre-push checks..."

# Run tests
npm run test:ci

echo "Pre-push checks passed!"
EOF
    chmod +x .git/hooks/pre-push
    echo -e "  ${GREEN}✓${NC} Created pre-push hook"
else
    echo -e "${YELLOW}⊘${NC} Not a git repository, skipping hooks"
fi
echo ""

# Verify setup
echo -e "${BOLD}[6/6]${NC} Verifying setup..."

# Type check
echo -e "${YELLOW}Running type check...${NC}"
if npm run type-check 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} Type check passed"
else
    echo -e "  ${YELLOW}⚠${NC} Type check failed (may need to fix issues)"
fi

# Build check
echo -e "${YELLOW}Testing build...${NC}"
if npm run build 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} Build successful"
    rm -rf .next dist  # Clean up build artifacts
else
    echo -e "  ${YELLOW}⚠${NC} Build failed (may need to fix issues)"
fi

echo ""
echo -e "${BOLD}╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║         Setup Complete!              ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Your development environment is ready!${NC}"
echo ""
echo "Next steps:"
echo "  1. Configure your environment in .env.local"
echo "  2. Start the development server:"
echo -e "     ${BLUE}./dev/dev.sh${NC}"
echo "  3. Open http://localhost:3000"
echo ""
