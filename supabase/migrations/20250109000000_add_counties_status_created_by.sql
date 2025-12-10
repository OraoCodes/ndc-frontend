-- Add status and created_by fields to counties table
-- Created: 2025-01-09
-- Purpose: Support status tracking (draft/published) and creator tracking for counties list page

-- ============================================================================
-- ADD NEW COLUMNS TO COUNTIES TABLE
-- ============================================================================

-- Add created_by field to track who created the county
ALTER TABLE counties 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Add status field to track publication status (draft or published)
ALTER TABLE counties 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' 
CHECK (status IN ('draft', 'published'));

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_counties_status ON counties(status);

-- Index for filtering by created_by
CREATE INDEX IF NOT EXISTS idx_counties_created_by ON counties(created_by);

-- ============================================================================
-- UPDATE EXISTING RECORDS
-- ============================================================================

-- Set all existing counties to 'published' status by default
-- (You can change this to 'draft' if you prefer)
UPDATE counties 
SET status = 'published' 
WHERE status = 'draft' AND created_by IS NULL;

