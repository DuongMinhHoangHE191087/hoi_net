-- Create AI Analysis Cache Table
CREATE TABLE IF NOT EXISTS ai_analysis_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_hash TEXT NOT NULL,
  prompt_hash TEXT,
  model TEXT NOT NULL,
  action_type TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicates
  CONSTRAINT unique_cache_entry UNIQUE (image_hash, prompt_hash, model, action_type)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_ai_cache_lookup ON ai_analysis_cache(image_hash, prompt_hash, action_type);

-- Policy (optional: restrict access if needed, but usually server-side access only)
ALTER TABLE ai_analysis_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Server side only access" ON ai_analysis_cache
  USING (false) -- No public access
  WITH CHECK (false);

-- Function to cleanup old cache (can be called via cron)
CREATE OR REPLACE FUNCTION cleanup_ai_cache(days_to_keep INT DEFAULT 30)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM ai_analysis_cache
  WHERE last_accessed_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
