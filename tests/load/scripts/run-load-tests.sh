#!/bin/bash

# Spreadsheet Moment Load Test Runner
# Executes all load test scenarios and generates reports

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOAD_TEST_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$LOAD_TEST_DIR/data"
REPORT_DIR="$LOAD_TEST_DIR/reports"
K6_DIR="$LOAD_TEST_DIR/k6"
ARTILLERY_DIR="$LOAD_TEST_DIR/artillery"

BASE_URL="${BASE_URL:-http://localhost:4000}"
API_KEY="${API_KEY:-test-api-key}"

# Create directories
mkdir -p "$DATA_DIR"
mkdir -p "$REPORT_DIR"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo "================================"
    echo "$1"
    echo "================================"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check k6
    if command -v k6 &> /dev/null; then
        K6_VERSION=$(k6 version | grep -oP 'k6 v\K[0-9.]+' || echo "unknown")
        log_success "k6 is installed (version: $K6_VERSION)"
    else
        log_error "k6 is not installed. Install from: https://k6.io/"
        exit 1
    fi

    # Check artillery
    if command -v artillery &> /dev/null; then
        log_success "artillery is installed"
    else
        log_warning "artillery is not installed. WebSocket tests will be skipped."
    fi

    # Check docker
    if command -v docker &> /dev/null; then
        log_success "docker is installed"
    else
        log_warning "docker is not installed. Monitoring stack will not be available."
    fi

    # Check application
    if curl -s -f "$BASE_URL/health" > /dev/null 2>&1; then
        log_success "Application is accessible at $BASE_URL"
    else
        log_error "Application is not accessible at $BASE_URL"
        log_info "Start the application first or set BASE_URL environment variable"
        exit 1
    fi
}

# Generate test data
generate_test_data() {
    print_header "Generating Test Data"

    if [ ! -f "$DATA_DIR/test-users.json" ]; then
        log_info "Generating test users..."
        node "$SCRIPT_DIR/generate-users.js"
    else
        log_info "Test users already exist, skipping generation"
    fi

    if [ ! -f "$DATA_DIR/test-spreadsheets.json" ]; then
        log_info "Generating test spreadsheets..."
        node "$SCRIPT_DIR/generate-spreadsheets.js"
    else
        log_info "Test spreadsheets already exist, skipping generation"
    fi
}

# Start monitoring infrastructure
start_monitoring() {
    print_header "Starting Monitoring Infrastructure"

    cd "$LOAD_TEST_DIR"

    if docker-compose ps | grep -q "Up"; then
        log_info "Monitoring infrastructure already running"
    else
        log_info "Starting Prometheus and Grafana..."
        docker-compose up -d prometheus grafana

        log_info "Waiting for services to be ready..."
        sleep 10

        log_success "Monitoring infrastructure started"
        log_info "Grafana: http://localhost:3000 (admin/admin)"
        log_info "Prometheus: http://localhost:9090"
    fi
}

# Run k6 tests
run_k6_test() {
    local test_name=$1
    local test_file=$2
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local report_file="$REPORT_DIR/${test_name}-${timestamp}.json"

    print_header "Running $test_name Test"

    log_info "Test file: $test_file"
    log_info "Report: $report_file"

    K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT="$REPORT_DIR/${test_name}-${timestamp}.html" \
    k6 run \
        --out json="$report_file" \
        --summary-export="$REPORT_DIR/${test_name}-${timestamp}-summary.json" \
        --env BASE_URL="$BASE_URL" \
        --env API_KEY="$API_KEY" \
        "$test_file"

    if [ $? -eq 0 ]; then
        log_success "$test_name test completed successfully"
        return 0
    else
        log_error "$test_name test failed"
        return 1
    fi
}

# Run artillery tests
run_artillery_test() {
    local test_name=$1
    local test_file=$2
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local report_file="$REPORT_DIR/${test_name}-${timestamp}.json"

    print_header "Running $test_name WebSocket Test"

    if ! command -v artillery &> /dev/null; then
        log_warning "artillery not installed, skipping WebSocket tests"
        return 0
    fi

    log_info "Test file: $test_file"
    log_info "Report: $report_file"

    artillery run "$test_file" --output "$report_file"

    if [ $? -eq 0 ]; then
        log_success "$test_name test completed successfully"

        # Generate HTML report
        artillery report "$report_file" --output "$REPORT_DIR/${test_name}-${timestamp}.html"
        return 0
    else
        log_error "$test_name test failed"
        return 1
    fi
}

# Generate summary report
generate_summary_report() {
    print_header "Generating Summary Report"

    local timestamp=$(date +%Y%m%d_%H%M%S)
    local summary_file="$REPORT_DIR/summary-${timestamp}.md"

    cat > "$summary_file" << EOF
# Load Test Summary Report

**Date:** $(date)
**Target:** $BASE_URL
**Test Duration:** $(date -d '1 hour ago' 2>/dev/null || date -v-1H 2>/dev/null)

## Test Results

EOF

    # Add k6 results
    for report in "$REPORT_DIR"/*.json; do
        if [ -f "$report" ]; then
            local test_name=$(basename "$report" .json | sed 's/-[0-9]*_[0-9]*$//')
            echo "### $test_name" >> "$summary_file"
            echo "" >> "$summary_file"
            echo '```json' >> "$summary_file"
            jq '.' "$report" >> "$summary_file" 2>/dev/null || echo "Could not parse JSON"
            echo '```' >> "$summary_file"
            echo "" >> "$summary_file"
        fi
    done

    log_success "Summary report generated: $summary_file"
}

# Main execution
main() {
    print_header "Spreadsheet Moment Load Testing Suite"

    # Parse arguments
    TEST_TYPE="${1:-all}"

    case "$TEST_TYPE" in
        baseline)
            check_prerequisites
            generate_test_data
            run_k6_test "baseline" "$K6_DIR/baseline-test.js"
            ;;
        rampup)
            check_prerequisites
            generate_test_data
            run_k6_test "rampup" "$K6_DIR/rampup-test.js"
            ;;
        sustained)
            check_prerequisites
            generate_test_data
            run_k6_test "sustained" "$K6_DIR/sustained-test.js"
            ;;
        spike)
            check_prerequisites
            generate_test_data
            run_k6_test "spike" "$K6_DIR/spike-test.js"
            ;;
        stress)
            check_prerequisites
            generate_test_data
            run_k6_test "stress" "$K6_DIR/stress-test.js"
            ;;
        websocket)
            check_prerequisites
            generate_test_data
            run_artillery_test "websocket-baseline" "$ARTILLERY_DIR/websocket-baseline.yml"
            run_artillery_test "websocket-stress" "$ARTILLERY_DIR/websocket-stress.yml"
            ;;
        all)
            check_prerequisites
            generate_test_data
            start_monitoring

            log_info "Running all load tests..."

            run_k6_test "baseline" "$K6_DIR/baseline-test.js" || true
            run_k6_test "rampup" "$K6_DIR/rampup-test.js" || true
            run_k6_test "sustained" "$K6_DIR/sustained-test.js" || true
            run_k6_test "spike" "$K6_DIR/spike-test.js" || true
            run_k6_test "stress" "$K6_DIR/stress-test.js" || true
            run_artillery_test "websocket-baseline" "$ARTILLERY_DIR/websocket-baseline.yml" || true
            run_artillery_test "websocket-stress" "$ARTILLERY_DIR/websocket-stress.yml" || true

            generate_summary_report

            print_header "All Tests Completed"
            log_info "Reports available in: $REPORT_DIR"
            log_info "Grafana dashboard: http://localhost:3000"
            ;;
        *)
            echo "Usage: $0 {baseline|rampup|sustained|spike|stress|websocket|all}"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
