-- User Requests Table
-- Stores photo restoration requests from users

CREATE TYPE request_type AS ENUM ('restore', 'family');
CREATE TYPE request_status AS ENUM ('pending', 'processing', 'completed', 'rejected');

CREATE TABLE IF NOT EXISTS user_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type request_type NOT NULL,
  description TEXT NOT NULL,
  status request_status DEFAULT 'pending',

  -- Images
  original_images TEXT[] NOT NULL, -- Array of image URLs
  restored_images TEXT[], -- Array of restored image URLs (filled by admin)

  -- Admin response
  admin_notes TEXT,
  admin_id UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_requests

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON user_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own requests
CREATE POLICY "Users can insert own requests"
  ON user_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending requests only
CREATE POLICY "Users can update own pending requests"
  ON user_requests
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own pending requests only
CREATE POLICY "Users can delete own pending requests"
  ON user_requests
  FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
  ON user_requests
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN (
        'admin@photoai.com',
        'duonghoang@gmail.com'
        -- Add your admin emails here
      )
    )
  );

-- Admins can update all requests
CREATE POLICY "Admins can update all requests"
  ON user_requests
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN (
        'admin@photoai.com',
        'duonghoang@gmail.com'
      )
    )
  );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_requests_user_id ON user_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_requests_status ON user_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_requests_created_at ON user_requests(created_at DESC);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_user_requests_updated_at ON user_requests;
CREATE TRIGGER update_user_requests_updated_at
  BEFORE UPDATE ON user_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set completed_at when status changes to completed
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_request_completed_at ON user_requests;
CREATE TRIGGER set_request_completed_at
  BEFORE UPDATE ON user_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_completed_at();

-- Grant permissions
GRANT ALL ON user_requests TO authenticated;
GRANT SELECT ON user_requests TO anon;

-- Comments for documentation
COMMENT ON TABLE user_requests IS 'Photo restoration requests from users';
COMMENT ON COLUMN user_requests.id IS 'Unique request ID';
COMMENT ON COLUMN user_requests.user_id IS 'User who created the request';
COMMENT ON COLUMN user_requests.type IS 'Type of request: restore or family';
COMMENT ON COLUMN user_requests.description IS 'User description of the request';
COMMENT ON COLUMN user_requests.status IS 'Current status: pending, processing, completed, rejected';
COMMENT ON COLUMN user_requests.original_images IS 'Array of original image URLs from storage';
COMMENT ON COLUMN user_requests.restored_images IS 'Array of restored image URLs (admin uploads)';
COMMENT ON COLUMN user_requests.admin_notes IS 'Admin notes/feedback';
COMMENT ON COLUMN user_requests.admin_id IS 'Admin who processed the request';
COMMENT ON COLUMN user_requests.completed_at IS 'Timestamp when request was completed';

-- Create a view for request statistics
CREATE OR REPLACE VIEW user_request_stats AS
SELECT
  user_id,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
  COUNT(*) FILTER (WHERE status = 'processing') as processing_requests,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_requests,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_requests
FROM user_requests
GROUP BY user_id;

-- Grant permissions on view
GRANT SELECT ON user_request_stats TO authenticated;

COMMENT ON VIEW user_request_stats IS 'Statistics view for user requests';
