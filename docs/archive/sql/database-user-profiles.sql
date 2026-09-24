-- User Profiles Table
-- Stores extended user information beyond auth.users

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  facebook_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;

-- Comments for documentation
COMMENT ON TABLE user_profiles IS 'Extended user profile information';
COMMENT ON COLUMN user_profiles.id IS 'References auth.users(id)';
COMMENT ON COLUMN user_profiles.full_name IS 'User full name (2-100 characters)';
COMMENT ON COLUMN user_profiles.phone IS 'Vietnamese phone number (10-11 digits)';
COMMENT ON COLUMN user_profiles.address IS 'User address (10-200 characters)';
COMMENT ON COLUMN user_profiles.facebook_url IS 'Facebook profile URL';
COMMENT ON COLUMN user_profiles.avatar_url IS 'Avatar image URL from storage';
