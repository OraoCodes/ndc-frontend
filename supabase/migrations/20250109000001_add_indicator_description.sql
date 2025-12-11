-- Add description field to indicators table
-- Created: 2025-01-09
-- Purpose: Add description field for indicators to provide more context

-- ============================================================================
-- ADD DESCRIPTION COLUMN TO INDICATORS TABLE
-- ============================================================================

ALTER TABLE indicators 
ADD COLUMN IF NOT EXISTS description TEXT;

-- ============================================================================
-- ADD INDEX FOR PERFORMANCE (if needed for searching)
-- ============================================================================

-- Optional: Add index if you plan to search by description
-- CREATE INDEX IF NOT EXISTS idx_indicators_description ON indicators USING gin(to_tsvector('english', description));


