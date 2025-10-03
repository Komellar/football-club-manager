-- Initial database setup for Football Club Manager
-- This script runs when PostgreSQL container starts for the first time

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create test database 
CREATE DATABASE football_club_manager_test;
