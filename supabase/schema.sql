-- RateMyPI Database Schema

-- Reviews table - stores all PI reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pi_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  lab_group_name TEXT, -- Lab/group name
  field TEXT, -- Academic field (e.g., Computer Science, Biology, Physics)
  position TEXT NOT NULL CHECK (position IN ('PhD', 'Postdoc', 'Intern', 'Visitor')),
  year INTEGER NOT NULL CHECK (year >= 2015 AND year <= 2030),
  ratings JSONB NOT NULL, -- {supervision: 1-5, communication: 1-5, career_help: 1-5, work_life_balance: 1-5, lab_environment: 1-5}
  review_text TEXT,
  is_anonymous BOOLEAN DEFAULT TRUE, -- Whether reviewer wants to remain anonymous
  reviewer_name TEXT, -- Reviewer's name or nickname (NULL if anonymous)
  is_flagged BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Moderation logs - tracks all moderation decisions
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_text TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('ACCEPTED', 'REJECTED_SOFT', 'REJECTED_HARD')),
  reason TEXT,
  method TEXT DEFAULT 'AUTO', -- AUTO, MANUAL, LLM
  created_at TIMESTAMP DEFAULT NOW()
);

-- PI profiles - aggregated data per PI
CREATE TABLE IF NOT EXISTS pi_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  lab_group_name TEXT, -- New field for lab/group name
  field TEXT,
  country TEXT,
  review_count INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, institution)
);

-- Reported content - user reports on reviews
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_pi_name ON reviews(pi_name);
CREATE INDEX IF NOT EXISTS idx_reviews_institution ON reviews(institution);
CREATE INDEX IF NOT EXISTS idx_reviews_lab_group ON reviews(lab_group_name);
CREATE INDEX IF NOT EXISTS idx_reviews_field ON reviews(field); -- Index for academic field
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_pi_profiles_name ON pi_profiles(name);
CREATE INDEX IF NOT EXISTS idx_pi_profiles_lab_group ON pi_profiles(lab_group_name);
CREATE INDEX IF NOT EXISTS idx_pi_profiles_field ON pi_profiles(field); -- Index for academic field
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created_at ON moderation_logs(created_at);

-- Function to update PI profile statistics
CREATE OR REPLACE FUNCTION update_pi_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert PI profile statistics
  INSERT INTO pi_profiles (name, institution, lab_group_name, field, review_count, average_rating, updated_at)
  VALUES (
    NEW.pi_name,
    NEW.institution,
    NEW.lab_group_name, -- Include lab group name
    NEW.field, -- Include academic field
    1,
    ((NEW.ratings->>'supervision')::DECIMAL + 
     (NEW.ratings->>'communication')::DECIMAL + 
     (NEW.ratings->>'career_help')::DECIMAL + 
     (NEW.ratings->>'work_life_balance')::DECIMAL + 
     (NEW.ratings->>'lab_environment')::DECIMAL) / 5.0,
    NOW()
  )
  ON CONFLICT (name, institution) 
  DO UPDATE SET
    lab_group_name = COALESCE(NEW.lab_group_name, pi_profiles.lab_group_name), -- Update lab group if provided
    field = COALESCE(NEW.field, pi_profiles.field), -- Update field if provided
    review_count = (
      SELECT COUNT(*) FROM reviews 
      WHERE pi_name = NEW.pi_name AND institution = NEW.institution
    ),
    average_rating = (
      SELECT AVG(
        ((ratings->>'supervision')::DECIMAL + 
         (ratings->>'communication')::DECIMAL + 
         (ratings->>'career_help')::DECIMAL + 
         (ratings->>'work_life_balance')::DECIMAL + 
         (ratings->>'lab_environment')::DECIMAL) / 5.0
      )
      FROM reviews 
      WHERE pi_name = NEW.pi_name AND institution = NEW.institution
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update PI stats when review is added
CREATE TRIGGER update_pi_stats_trigger
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_pi_stats();

-- Add the new columns to existing tables (for migration)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS lab_group_name TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS field TEXT;
ALTER TABLE pi_profiles ADD COLUMN IF NOT EXISTS lab_group_name TEXT; 