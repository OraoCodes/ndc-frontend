-- Add RLS policies for INSERT, UPDATE, DELETE on indicators table
-- Created: 2025-01-08

-- ============================================================================
-- INDICATORS RLS POLICIES
-- ============================================================================

-- Drop existing policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Authenticated users can manage indicators" ON indicators;

-- Authenticated users can manage indicators (INSERT, UPDATE, DELETE)
CREATE POLICY "Authenticated users can manage indicators" 
  ON indicators FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');




