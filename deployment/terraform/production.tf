# Spreadsheet Moment - Production Infrastructure (Terraform)
# ======================================================================
#
# This Terraform configuration deploys the complete production
# infrastructure for Spreadsheet Moment on Cloudflare.
#
# Resources:
# - Cloudflare Pages (website hosting)
# - Cloudflare Workers (API)
# - Cloudflare D1 (database)
# - Cloudflare KV (key-value storage)
# - Cloudflare Durable Objects (real-time collaboration)
# - Cloudflare R2 (file storage)
# - Cloudflare Vectorize (vector search)
# - Cloudflare Queue (async processing)
# - Cloudflare Analytics (monitoring)
#
# Usage:
#   terraform init
#   terraform workspace new production
#   terraform apply

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  provider "cloudflare" {
    # API token sourced from CLOUDFLARE_API_TOKEN environment variable
}

# ============================================================================
# Variables
# ============================================================================

variable "environment" {
  description = "Environment name (production, staging)"
  type        = string
  default     = "production"
}

variable "domain" {
  description = "Custom domain (e.g., spreadsheet-moment.superinstance.ai)"
  type        = string
  default     = "spreadsheet-moment.superinstance.ai"
}

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

# ============================================================================
# Cloudflare Pages - Website Hosting
# ============================================================================

resource "cloudflare_pages_project" "spreadsheet_moment" {
  account_id        = var.account_id
  name              = "spreadsheet-moment"
  production_branch = "main"

  source {
    type = "github"

    config {
      owner                   = "SuperInstance"
      repo                    = "spreadsheet-moment"
      production_branch       = "main"
      pr_comments_enabled     = true
      deployments_enabled     = true
      preview_deployment_setting = "custom"
      preview_branch_includes = ["preview", "staging"]
    }
  }

  build_config {
    command = "cd website && npm install && npm run build"
    destination_dir = "website/dist"
  }

  # Deployment configurations
  deployment_configs {
    preview {
      environment_variables = {
        NODE_ENV = "development"
        API_URL  = "https://api-preview.superinstance.ai"
      }

      // Fail on build errors
      failure_action = "rollback"
    }

    production {
      environment_variables = {
        NODE_ENV = "production"
        API_URL  = "https://api.superinstance.ai"
      }

      // Always deploy production commits
      failure_action = "rollback"
    }
  }

  // Custom domain configuration
  custom_domains {
    domain = var.domain
  }

  // Environment-specific settings
  environments {
    preview {
      name = "preview"
      deployment_configs {
        preview {
          production_branch = "staging"
          preview_deployment_setting = "custom"
          preview_branch_includes = ["preview"]
        }
      }
    }

    production {
      name = "production"
      deployment_configs {
        production {
          production_branch = "main"
          // No preview configs for production
        }
      }
    }
  }
}

# ============================================================================
# Cloudflare Workers - API
# ============================================================================

resource "cloudflare_worker_script" "spreadsheet_moment_api" {
  account_id = var.account_id
  name       = "spreadsheet-moment-api"
  content    = filebase64("${path.module}/../workers/dist/index.js")

  // Environment variables
  vars = {
    ENVIRONMENT = var.environment
    API_VERSION = "v1"
  }

  // KV namespace bindings
  kv_namespace_bindings {
    name        = "CELL_DATA"
    namespace_id = cloudflare_workers_kv_namespace.cell_data.id
  }

  kv_namespace_bindings {
    name        = "SPREADSHEET_METADATA"
    namespace_id = cloudflare_workers_kv_namespace.spreadsheet_metadata.id
  }

  // D1 database binding
  d1_database_bindings {
    name        = "DB"
    database_id = cloudflare_d1_database.spreadsheet_moment_db.id
  }

  // R2 bucket binding
  r2_bucket_bindings {
    name        = "FILE_STORAGE"
    bucket_name  = cloudflare_r2_bucket.spreadsheet_moment_files.name
  }

  // Queue binding
  queue_bindings {
    name    = "CELL_PROCESSOR"
    queue_id = cloudflare_queue.cell_processing_queue.id
  }
}

// Workers KV Namespaces
resource "cloudflare_workers_kv_namespace" "cell_data" {
  account_id = var.account_id
  title      = "Cell Data Storage"
}

resource "cloudflare_workers_kv_namespace" "spreadsheet_metadata" {
  account_id = var.account_id
  title      = "Spreadsheet Metadata Storage"
}

# ============================================================================
# Cloudflare D1 - Database
# ============================================================================

resource "cloudflare_d1_database" "spreadsheet_moment_db" {
  account_id = var.account_id
  name       = "spreadsheet_moment_db"
  schema     = <<-EOF
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Spreadsheets table
    CREATE TABLE IF NOT EXISTS spreadsheets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Collaborators table
    CREATE TABLE IF NOT EXISTS collaborators (
      spreadsheet_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT DEFAULT 'viewer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (spreadsheet_id, user_id),
      FOREIGN KEY (spreadsheet_id) REFERENCES spreadsheets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Cell history table
    CREATE TABLE IF NOT EXISTS cell_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      spreadsheet_id TEXT NOT NULL,
      cell_id TEXT NOT NULL,
      value TEXT,
      author_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (spreadsheet_id) REFERENCES spreadsheets(id) ON DELETE CASCADE
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_spreadsheets_owner ON spreadsheets(owner_id);
    CREATE INDEX IF NOT EXISTS idx_collaborators_user ON collaborators(user_id);
    CREATE INDEX IF NOT EXISTS idx_cell_history_spreadsheet ON cell_history(spreadsheet_id);
  EOF
}

# ============================================================================
# Cloudflare R2 - File Storage
# ============================================================================

resource "cloudflare_r2_bucket" "spreadsheet_moment_files" {
  account_id = var.account_id
  name       = "spreadsheet-moment-files"
  location   = "auto"  // Automatically select best region

  // Lifecycle rules for automatic cleanup
  lifecycle_rule {
    enable_cleanup = true

    expiration_rule {
      days                     = 30
      noncurrent_version_expiration = 7
    }
  }
}

# ============================================================================
# Cloudflare Queue - Async Processing
# ============================================================================

resource "cloudflare_queue" "cell_processing_queue" {
  account_id = var.account_id
  name       = "cell-processing-queue"

  // Queue settings
  settings {
    message_delay_seconds = 0
  }
}

# ============================================================================
# Cloudflare Analytics - Monitoring
# ============================================================================

resource "cloudflare_analytics_site" "spreadsheet_moment_analytics" {
  account_id = var.account_id

  sites = [
    {
      name = "spreadsheet-moment-website"
      host = "spreadsheet-moment.superinstance.ai"
      pat = "site_token"  // Auto-generated by Cloudflare
      events = {
        site_search = true
      }
    }
  ]
}

# ============================================================================
# Cloudflare Access - Authentication
# ============================================================================

resource "cloudflare_access_application" "spreadsheet_moment" {
  account_id       = var.account_id
  name              = "Spreadsheet Moment"
  domain            = var.domain
  type              = "self_hosted"
  session_duration  = "24h"

  // Access policies
  policies = [
    // Allow authenticated GitHub users
    {
      decision       = "allow"
      name            = "GitHub Auth"
      include         = ["github"]
      app_ids         = []
      requires        = ["github"]
    }
  ]
}

# ============================================================================
# Cloudflare Auto SSL - SSL Certificates
# ============================================================================

resource "cloudflare_ssl" "spreadsheet_moment_ssl" {
  account_id       = var.account_id
  zone_id           = cloudflare_zone.superinstance_ai.id
  custom_ssl        = false  // Use Let's Encrypt
  ssl_settings = {
    min_tls_version = "1.2"
  }
}

# ============================================================================
# Cloudflare Zone (if creating new zone)
# ============================================================================

resource "cloudflare_zone" "superinstance_ai" {
  account_id = var.account_id
  zone       = "superinstance.ai"
  type       = "full"
}

# ============================================================================
# Output Values
# ============================================================================

output "website_url" {
  description = "URL of the deployed website"
  value       = "https://${var.domain}"
}

output "api_url" {
  description = "URL of the Workers API"
  value       = "https://api.superinstance.ai/spreadsheet-moment"
}

output "dashboard_url" {
  description = "URL of the Cloudflare dashboard"
  value       = "https://dash.cloudflare.com"
}

output "analytics_id" {
  description = "Analytics site ID for monitoring"
  value       = cloudflare_analytics_site.spreadsheet_moment_analytics.id
}
