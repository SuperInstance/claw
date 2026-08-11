#!/usr/bin/env python3
"""
Sentry Integration for Spreadsheet Moment
Error tracking and alerting system

This script configures Sentry integration with the application
"""

import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.aws_lambda import AwsLambdaIntegration
import os

# Sentry DSN from environment
SENTRY_DSN = os.getenv('SENTRY_DSN')
ENVIRONMENT = os.getenv('ENVIRONMENT', 'production')
RELEASE = os.getenv('APP_VERSION', '1.0.0')

# Initialize Sentry
def init_sentry(app=None):
    """
    Initialize Sentry SDK with appropriate integrations
    """
    if not SENTRY_DSN:
        print("Warning: SENTRY_DSN not configured")
        return

    # Configure Sentry SDK
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=ENVIRONMENT,
        release=RELEASE,

        # Sampling configuration
        traces_sample_rate=0.1,  # 10% of transactions
        profiles_sample_rate=0.1,  # 10% of profiles

        # Integrations
        integrations=[
            FlaskIntegration(),
            RedisIntegration(),
            SqlalchemyIntegration(),
            CeleryIntegration(),
            AwsLambdaIntegration(),
        ],

        # Before send callback for filtering
        before_send=before_send_filter,

        # Before breadcrumb callback
        before_breadcrumb=before_breadcrumb_filter,

        # Error sampling
        sample_rate=1.0,

        # Attach stack traces
        attach_stacktrace=True,

        # Send PII (Personally Identifiable Information)
        send_default_pii=False,

        # Maximum number of breadcrumbs
        max_breadcrumbs=100,

        # Server name
        server_name=os.getenv('HOSTNAME', 'unknown'),

        # Debug mode
        debug=False,
    )

    # Configure custom tags and context
    configure_tags()

    print(f"Sentry initialized: {ENVIRONMENT} environment, release {RELEASE}")


def before_send_filter(event, hint):
    """
    Filter events before sending to Sentry
    """
    # Filter out health check errors
    if 'exception' in event:
        for exception in event['exception']['values']:
            if 'health' in exception.get('value', '').lower():
                return None

    # Filter out 404 errors
    if 'request' in event:
        if event['request'].get('status_code') == 404:
            return None

    # Add custom context
    event['contexts'] = event.get('contexts', {})
    event['contexts']['app'] = {
        'name': 'spreadsheet-moment',
        'component': os.getenv('COMPONENT', 'api'),
    }

    return event


def before_breadcrumb_filter(breadcrumb, hint):
    """
    Filter breadcrumbs before adding to event
    """
    # Filter out health check breadcrumbs
    if breadcrumb.get('category', '').startswith('health'):
        return None

    # Filter out static asset requests
    if breadcrumb.get('category') == 'http':
        url = breadcrumb.get('data', {}).get('url', '')
        if any(ext in url for ext in ['.js', '.css', '.png', '.jpg', '.svg']):
            return None

    return breadcrumb


def configure_tags():
    """
    Configure default tags for all events
    """
    sentry_sdk.set_tag("environment", ENVIRONMENT)
    sentry_sdk.set_tag("component", os.getenv('COMPONENT', 'api'))
    sentry_sdk.set_tag("region", os.getenv('AWS_REGION', 'us-east-1'))
    sentry_sdk.set_tag("cluster", os.getenv('CLUSTER_NAME', 'production'))


def set_user_context(user_id, email, username):
    """
    Set user context for error tracking
    """
    sentry_sdk.set_user({
        'id': user_id,
        'email': email,
        'username': username,
    })


def capture_exception(exception, tags=None, extra=None):
    """
    Capture an exception with optional tags and extra context
    """
    with sentry_sdk.push_scope() as scope:
        if tags:
            for key, value in tags.items():
                scope.set_tag(key, value)

        if extra:
            for key, value in extra.items():
                scope.set_extra(key, value)

        sentry_sdk.capture_exception(exception)


def capture_message(message, level='info', tags=None, extra=None):
    """
    Capture a message with optional level, tags, and extra context
    """
    with sentry_sdk.push_scope() as scope:
        if tags:
            for key, value in tags.items():
                scope.set_tag(key, value)

        if extra:
            for key, value in extra.items():
                scope.set_extra(key, value)

        sentry_sdk.capture_message(message, level=level)


def start_transaction(name, op='task', tags=None):
    """
    Start a performance monitoring transaction
    """
    transaction = sentry_sdk.start_transaction(
        name=name,
        op=op,
    )

    if tags:
        for key, value in tags.items():
            transaction.set_tag(key, value)

    return transaction


# Flask integration example
def init_sentry_flask(app):
    """
    Initialize Sentry for Flask application
    """
    init_sentry(app)

    @app.before_request
    def add_request_context():
        """Add request context to Sentry events"""
        sentry_sdk.set_tag('endpoint', str(request.path))

    @app.errorhandler(Exception)
    def handle_exception(e):
        """Handle exceptions and send to Sentry"""
        sentry_sdk.capture_exception(e)
        return {'error': 'Internal server error'}, 500


if __name__ == '__main__':
    # Test Sentry configuration
    print("Testing Sentry configuration...")

    try:
        init_sentry()
        print("Sentry initialized successfully")

        # Test error capture
        try:
            raise Exception("Test exception for Sentry")
        except Exception as e:
            capture_exception(e, tags={'test': True})
            print("Test exception sent to Sentry")

    except Exception as e:
        print(f"Sentry initialization failed: {e}")
