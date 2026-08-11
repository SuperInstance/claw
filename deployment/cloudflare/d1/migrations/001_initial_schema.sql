-- Migration 001: Initial Schema
-- This is the initial database schema migration
-- Run with: wrangler d1 execute <DATABASE_NAME> --file=./migrations/001_initial_schema.sql

-- Read schema from main schema file
.read ./schema.sql
