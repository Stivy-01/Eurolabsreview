-- Migration: Add reviewer identification fields to reviews table
-- Run this script to add the new columns to existing databases

-- Add the new columns to the reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS reviewer_name TEXT;

-- Add comments to document the new fields
COMMENT ON COLUMN reviews.is_anonymous IS 'Whether the reviewer wants to remain anonymous';
COMMENT ON COLUMN reviews.reviewer_name IS 'Reviewer name or nickname (NULL if anonymous)';

-- Create index for better performance when filtering by anonymous status
CREATE INDEX IF NOT EXISTS idx_reviews_is_anonymous ON reviews(is_anonymous);

-- Update existing reviews to be anonymous by default
UPDATE reviews 
SET is_anonymous = TRUE, reviewer_name = NULL 
WHERE is_anonymous IS NULL;

-- Verify the migration
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'reviews' 
  AND column_name IN ('is_anonymous', 'reviewer_name')
ORDER BY column_name; 