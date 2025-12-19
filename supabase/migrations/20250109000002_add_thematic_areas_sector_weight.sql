-- Add sector and weight_percentage fields to thematic_areas table
-- Created: 2025-01-09
-- Purpose: Link thematic areas to sectors (water/waste) and store weight percentages

-- ============================================================================
-- ADD SECTOR AND WEIGHT_PERCENTAGE COLUMNS TO THEMATIC_AREAS TABLE
-- ============================================================================

-- Add sector field to link thematic areas to water or waste sectors
ALTER TABLE thematic_areas 
ADD COLUMN IF NOT EXISTS sector TEXT CHECK(sector IN ('water', 'waste'));

-- Add weight_percentage field to store the weight percentage for each thematic area
ALTER TABLE thematic_areas 
ADD COLUMN IF NOT EXISTS weight_percentage REAL DEFAULT 0;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for filtering by sector
CREATE INDEX IF NOT EXISTS idx_thematic_areas_sector ON thematic_areas(sector);

-- ============================================================================
-- UPDATE EXISTING RECORDS (Optional - set default values)
-- ============================================================================

-- Note: You may want to manually update existing thematic areas to assign sectors
-- This migration just adds the columns without breaking existing data




