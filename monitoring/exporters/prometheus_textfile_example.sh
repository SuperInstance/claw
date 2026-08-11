#!/bin/bash
# Example script to generate custom metrics for Prometheus node_exporter textfile collector
# This script should be run periodically via cron

METRICS_FILE="/var/lib/node_exporter/textfile_collector/sheet_moment_metrics.prom"
TEMP_FILE="${METRICS_FILE}.tmp"

# Create metrics file header
echo "# HELP sheet_moment_business_metrics Custom business metrics for Spreadsheet Moment" > $TEMP_FILE
echo "# TYPE sheet_moment_business_metrics gauge" >> $TEMP_FILE

# Example: Get active user count from your application
ACTIVE_USERS=$(curl -s http://localhost:8000/api/v1/metrics/users/active | jq -r '.active_users')
echo "sheet_moment_active_users $ACTIVE_USERS" >> $TEMP_FILE

# Example: Get revenue from your application
REVENUE=$(curl -s http://localhost:8000/api/v1/metrics/revenue/hourly | jq -r '.revenue')
echo "sheet_moment_revenue_hourly $REVENUE" >> $TEMP_FILE

# Example: Get conversion rate
CONVERSION_RATE=$(curl -s http://localhost:8000/api/v1/metrics/conversion | jq -r '.conversion_rate')
echo "sheet_moment_conversion_rate $CONVERSION_RATE" >> $TEMP_FILE

# Example: Get feature usage
FEATURE_USAGE=$(curl -s http://localhost:8000/api/v1/metrics/features | jq -r '.[] | "\(.feature_name) \(.usage_count)"')
while read -r feature usage; do
  echo "sheet_moment_feature_usage{feature_name=\"$feature\"} $usage" >> $TEMP_FILE
done <<< "$FEATURE_USAGE"

# Move temp file to metrics file (atomic operation)
mv $TEMP_FILE $METRICS_FILE

echo "Metrics updated successfully"
