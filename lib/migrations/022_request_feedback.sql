-- =====================================================
-- Request Feedback Table
-- Stores user ratings and feedback for completed requests
-- =====================================================

-- Create request_feedback table
CREATE TABLE IF NOT EXISTS request_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES user_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Main rating (required)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  -- Optional detailed ratings
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  speed_rating INTEGER CHECK (speed_rating >= 1 AND speed_rating <= 5),
  
  -- Feedback text
  comment TEXT,
  
  -- Would recommend flag
  would_recommend BOOLEAN,
  
  -- Tags for categorization
  tags TEXT[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one feedback per request
  UNIQUE(request_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_request_feedback_request ON request_feedback(request_id);
CREATE INDEX IF NOT EXISTS idx_request_feedback_user ON request_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_request_feedback_rating ON request_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_request_feedback_created ON request_feedback(created_at DESC);

-- Enable RLS
ALTER TABLE request_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own feedback
DROP POLICY IF EXISTS "users_view_own_feedback" ON request_feedback;
CREATE POLICY "users_view_own_feedback" ON request_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create feedback for their requests
DROP POLICY IF EXISTS "users_create_feedback" ON request_feedback;
CREATE POLICY "users_create_feedback" ON request_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own feedback
DROP POLICY IF EXISTS "users_update_own_feedback" ON request_feedback;
CREATE POLICY "users_update_own_feedback" ON request_feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Admins can view all feedback
DROP POLICY IF EXISTS "admins_view_all_feedback" ON request_feedback;
CREATE POLICY "admins_view_all_feedback" ON request_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_request_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_request_feedback_updated_at ON request_feedback;
CREATE TRIGGER trigger_update_request_feedback_updated_at
  BEFORE UPDATE ON request_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_request_feedback_updated_at();

-- Function to get average rating for all requests
CREATE OR REPLACE FUNCTION get_average_request_rating()
RETURNS TABLE (
  total_feedback BIGINT,
  average_rating NUMERIC,
  rating_5_count BIGINT,
  rating_4_count BIGINT,
  rating_3_count BIGINT,
  rating_2_count BIGINT,
  rating_1_count BIGINT,
  recommend_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_feedback,
    ROUND(AVG(rf.rating)::NUMERIC, 2) as average_rating,
    COUNT(*) FILTER (WHERE rf.rating = 5)::BIGINT as rating_5_count,
    COUNT(*) FILTER (WHERE rf.rating = 4)::BIGINT as rating_4_count,
    COUNT(*) FILTER (WHERE rf.rating = 3)::BIGINT as rating_3_count,
    COUNT(*) FILTER (WHERE rf.rating = 2)::BIGINT as rating_2_count,
    COUNT(*) FILTER (WHERE rf.rating = 1)::BIGINT as rating_1_count,
    ROUND(
      (COUNT(*) FILTER (WHERE rf.would_recommend = true)::NUMERIC / 
       NULLIF(COUNT(*) FILTER (WHERE rf.would_recommend IS NOT NULL), 0) * 100),
      1
    ) as recommend_percentage
  FROM request_feedback rf;
END;
$$;

-- Comment
COMMENT ON TABLE request_feedback IS 'Stores user ratings and feedback for completed photo restoration requests';
