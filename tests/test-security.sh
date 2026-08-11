#!/bin/bash
# Spreadsheet Moment - Security Tests
# Runs security audits and vulnerability scans

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SECURITY_REPORT="${PROJECT_ROOT}/reports/security-report-$(date +%Y%m%d_%H%M%S).txt"

mkdir -p "$(dirname "$SECURITY_REPORT")"

echo -e "${BLUE}Running Security Tests${NC}"
echo ""
echo "Report will be saved to: $SECURITY_REPORT"
echo ""

# Header
{
    echo "Spreadsheet Moment - Security Test Report"
    echo "Generated: $(date)"
    echo "=========================================="
    echo ""
} | tee "$SECURITY_REPORT"

# 1. npm audit
echo -e "${YELLOW}[1/4] Running npm audit...${NC}"
{
    echo ""
    echo "## npm audit"
    echo "-------------"
} | tee -a "$SECURITY_REPORT"

if npm audit --json > /tmp/audit.json 2>&1; then
    echo -e "${GREEN}✓${NC} No known vulnerabilities found"
    {
        echo "Status: PASSED"
        echo "No known vulnerabilities found"
    } | tee -a "$SECURITY_REPORT"
else
    AUDIT_LEVEL=$(npm audit --json 2>/dev/null | jq -r '.metadata.vulnerabilities | select(.info != 0 or .low != 0 or .moderate != 0 or .high != 0 or .critical != 0)')

    echo -e "${YELLOW}⚠${NC} Vulnerabilities found"
    npm audit --audit-level=moderate | tee -a "$SECURITY_REPORT"
fi

# 2. Snyk test (if available)
echo ""
echo -e "${YELLOW}[2/4] Running Snyk test...${NC}"
{
    echo ""
    echo "## Snyk Test"
    echo "------------"
} | tee -a "$SECURITY_REPORT"

if command -v snyk &> /dev/null; then
    snyk test --json > /tmp/snyk.json 2>&1 || true
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Snyk test passed"
        {
            echo "Status: PASSED"
        } | tee -a "$SECURITY_REPORT"
    else
        echo -e "${YELLOW}⚠${NC} Snyk found vulnerabilities"
        snyk test | tee -a "$SECURITY_REPORT"
    fi
else
    echo -e "${YELLOW}⊘${NC} Snyk not installed (https://snyk.io)"
    {
        echo "Status: SKIPPED (Snyk not installed)"
    } | tee -a "$SECURITY_REPORT"
fi

# 3. Code security scan with semgrep (if available)
echo ""
echo -e "${YELLOW}[3/4] Running code security scan...${NC}"
{
    echo ""
    echo "## Code Security Scan"
    echo "--------------------"
} | tee -a "$SECURITY_REPORT"

if command -v semgrep &> /dev/null; then
    if semgrep --config auto --json . > /tmp/semgrep.json 2>&1; then
        echo -e "${GREEN}✓${NC} No security issues found"
        {
            echo "Status: PASSED"
            echo "No security issues found"
        } | tee -a "$SECURITY_REPORT"
    else
        echo -e "${YELLOW}⚠${NC} Security issues found"
        semgrep --config auto . | tee -a "$SECURITY_REPORT"
    fi
else
    echo -e "${YELLOW}⊘${NC} Semgrep not installed (https://semgrep.dev)"
    {
        echo "Status: SKIPPED (Semgrep not installed)"
    } | tee -a "$SECURITY_REPORT"
fi

# 4. Check for secrets in code
echo ""
echo -e "${YELLOW}[4/4] Scanning for secrets...${NC}"
{
    echo ""
    echo "## Secret Scanning"
    echo "------------------"
} | tee -a "$SECURITY_REPORT"

if command -v trufflehog &> /dev/null; then
    if trufflehog filesystem . --json 2>/dev/null | jq -e '.results | length == 0' > /dev/null; then
        echo -e "${GREEN}✓${NC} No secrets found"
        {
            echo "Status: PASSED"
            echo "No secrets found"
        } | tee -a "$SECURITY_REPORT"
    else
        echo -e "${RED}✗${NC} Potential secrets found!"
        trufflehog filesystem . | tee -a "$SECURITY_REPORT"
    fi
else
    # Basic secret scan with grep
    SECRET_PATTERNS=(
        "password\s*=\s*['\"][^'\"]+['\"]"
        "api[_-]?key\s*=\s*['\"][^'\"]+['\"]"
        "secret[_-]?key\s*=\s*['\"][^'\"]+['\"]"
        "token\s*=\s*['\"][^'\"]+['\"]"
    )

    SECRETS_FOUND=false
    for pattern in "${SECRET_PATTERNS[@]}"; do
        if grep -r -i -E "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
            --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist . 2>/dev/null; then
            SECRETS_FOUND=true
        fi
    done

    if [ "$SECRETS_FOUND" = true ]; then
        echo -e "${RED}✗${NC} Potential secrets found!"
        {
            echo "Status: WARNING"
            echo "Potential secrets found in code"
        } | tee -a "$SECURITY_REPORT"
    else
        echo -e "${GREEN}✓${NC} No secrets found"
        {
            echo "Status: PASSED"
            echo "No secrets found"
        } | tee -a "$SECURITY_REPORT"
    fi
fi

# Summary
echo ""
echo -e "${BOLD}╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║       Security Test Summary          ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════╝${NC}"
echo ""
echo "Full report: $SECURITY_REPORT"
echo ""

echo -e "${GREEN}Security tests completed!${NC}"
echo "Review the report for any findings."

exit 0
