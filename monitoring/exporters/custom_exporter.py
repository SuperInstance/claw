#!/usr/bin/env python3
"""
Spreadsheet Moment Custom Prometheus Exporter
Exports application-specific metrics for Prometheus scraping
"""

from prometheus_client import start_http_server, Gauge, Counter, Histogram, Info
import time
import random
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Business Metrics
active_users = Gauge('sheet_moment_active_users', 'Number of currently active users')
daily_active_users = Gauge('sheet_moment_dau', 'Daily active users')
monthly_active_users = Gauge('sheet_moment_mau', 'Monthly active users')
revenue_total = Counter('sheet_moment_revenue_total', 'Total revenue generated', ['currency'])
conversion_rate = Gauge('sheet_moment_conversion_rate', 'Conversion rate percentage')
cart_abandonments = Counter('sheet_moment_cart_abandonments_total', 'Total cart abandonments')
cart_creations = Counter('sheet_moment_cart_creations_total', 'Total cart creations')

# Feature Usage Metrics
feature_usage = Counter('sheet_moment_feature_usage_total', 'Feature usage count', ['feature_name', 'user_type'])

# Performance Metrics
request_duration = Histogram('sheet_moment_request_duration_seconds', 'Request duration', ['endpoint', 'method'])
response_size = Histogram('sheet_moment_response_size_bytes', 'Response size', ['endpoint', 'method'])

# Error Metrics
error_count = Counter('sheet_moment_errors_total', 'Total error count', ['error_type', 'endpoint'])
error_recovery_time = Gauge('sheet_moment_error_recovery_seconds', 'Time taken to recover from errors', ['error_type'])

# Security Metrics
auth_attempts = Counter('sheet_moment_auth_attempts_total', 'Total authentication attempts', ['status'])
auth_failures = Counter('sheet_moment_auth_failures_total', 'Total authentication failures', ['failure_reason'])
security_events = Counter('sheet_moment_security_events_total', 'Total security events', ['event_type', 'severity'])

# Database Metrics
db_query_duration = Histogram('sheet_moment_db_query_duration_seconds', 'Database query duration', ['query_type', 'table'])
db_connection_pool = Gauge('sheet_moment_db_connections', 'Database connection pool usage', ['state', 'database'])

# Application Metrics
application_info = Info('sheet_moment_application', 'Application information')
session_duration = Histogram('sheet_moment_session_duration_seconds', 'User session duration')
page_views = Counter('sheet_moment_page_views_total', 'Total page views', ['page_type'])

def collect_metrics():
    """Simulate collecting metrics from your application"""
    # Simulate active users
    user_count = random.randint(100, 500)
    active_users.set(user_count)
    daily_active_users.set(random.randint(1000, 5000))
    monthly_active_users.set(random.randint(10000, 50000))

    # Simulate revenue
    revenue_total.labels(currency='USD').inc(random.uniform(10, 100))
    conversion_rate.set(random.uniform(2, 5))

    # Simulate cart operations
    if random.random() > 0.7:
        cart_creations.inc()
    if random.random() > 0.8:
        cart_abandonments.inc()

    # Simulate feature usage
    features = ['spreadsheet_edit', 'chart_create', 'data_import', 'export', 'collaboration']
    for feature in features:
        feature_usage.labels(feature_name=feature, user_type='free').inc(random.randint(1, 10))
        feature_usage.labels(feature_name=feature, user_type='premium').inc(random.randint(1, 5))

    logger.info("Metrics collected successfully")

def main():
    """Main function to run the exporter"""
    # Start up the server to expose the metrics.
    start_http_server(8001)
    logger.info("Spreadsheet Moment Prometheus exporter started on port 8001")

    # Set application info
    application_info.info({
        'version': '1.0.0',
        'environment': 'production',
        'region': 'us-east-1'
    })

    # Generate some requests.
    while True:
        collect_metrics()
        time.sleep(15)

if __name__ == '__main__':
    main()
