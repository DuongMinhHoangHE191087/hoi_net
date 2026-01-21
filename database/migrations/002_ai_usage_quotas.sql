-- ============================================
-- AI Usage Log & User Quotas Migration
-- Photo Restore AI Backend Enhancement
-- Version: 1.0.0
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. AI Usage Log Table
-- Tracks every AI processing action per user
-- ============================================
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES user_requests(id) ON DELETE SET NULL,
  action_type VARCHAR(50) NOT NULL, -- 'restore', 'enhance', 'colorize', 'upscale'
  images_count INTEGER NOT NULL DEFAULT 1,
  credits_used INTEGER NOT NULL DEFAULT 1,
  prompt_used TEXT, -- Optional: Store the prompt used
  processing_time_ms INTEGER, -- Optional: Track processing duration
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_month ON ai_usage_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_action_type ON ai_usage_log(action_type);

-- Comments
COMMENT ON TABLE ai_usage_log IS 'Logs every AI image processing action for tracking and billing';
COMMENT ON COLUMN ai_usage_log.action_type IS 'Type of AI processing: restore, enhance, colorize, upscale';
COMMENT ON COLUMN ai_usage_log.credits_used IS 'Number of credits consumed (default 1 per request)';

-- ============================================
-- 2. User Quotas Table
-- Manages monthly usage limits per user
-- ============================================
CREATE TABLE IF NOT EXISTS user_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL DEFAULT 'free', -- 'free', 'premium', 'enterprise', 'admin'
  monthly_limit INTEGER NOT NULL DEFAULT 5,
  current_usage INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', NOW()),
  period_end TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', NOW()) + INTERVAL '1 month',
  extra_credits INTEGER DEFAULT 0, -- Bonus credits from promotions
  is_unlimited BOOLEAN DEFAULT FALSE, -- For admin/special accounts
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_quotas_user_id ON user_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quotas_tier ON user_quotas(tier);
CREATE INDEX IF NOT EXISTS idx_user_quotas_period_end ON user_quotas(period_end);

-- Comments
COMMENT ON TABLE user_quotas IS 'Manages monthly AI usage quotas per user';
COMMENT ON COLUMN user_quotas.tier IS 'User subscription tier: free (5/mo), premium (50/mo), enterprise (unlimited)';
COMMENT ON COLUMN user_quotas.extra_credits IS 'Bonus credits from promotions or purchases';
COMMENT ON COLUMN user_quotas.is_unlimited IS 'If true, user has unlimited usage (admin accounts)';

-- ============================================
-- 3. Tier Configuration Table
-- Stores tier definitions (configurable via admin)
-- ============================================
CREATE TABLE IF NOT EXISTS quota_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL, -- 'free', 'premium', 'enterprise'
  display_name VARCHAR(100) NOT NULL,
  monthly_limit INTEGER NOT NULL,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tiers
INSERT INTO quota_tiers (name, display_name, monthly_limit, price_monthly, features, display_order) VALUES
  ('free', 'Miễn Phí', 5, 0, '["5 ảnh/tháng", "Chất lượng cơ bản", "Hỗ trợ email"]'::jsonb, 1),
  ('premium', 'Premium', 50, 99000, '["50 ảnh/tháng", "Chất lượng cao", "Ưu tiên xử lý", "Hỗ trợ 24/7"]'::jsonb, 2),
  ('enterprise', 'Doanh Nghiệp', 9999, 499000, '["Không giới hạn", "Chất lượng tối đa", "API access", "Account manager"]'::jsonb, 3)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 4. Triggers & Functions
-- ============================================

-- Updated_at trigger for user_quotas
DROP TRIGGER IF EXISTS update_user_quotas_updated_at ON user_quotas;
CREATE TRIGGER update_user_quotas_updated_at
  BEFORE UPDATE ON user_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Updated_at trigger for quota_tiers
DROP TRIGGER IF EXISTS update_quota_tiers_updated_at ON quota_tiers;
CREATE TRIGGER update_quota_tiers_updated_at
  BEFORE UPDATE ON quota_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user has available quota
CREATE OR REPLACE FUNCTION check_user_quota(p_user_id UUID)
RETURNS TABLE(
  has_quota BOOLEAN,
  remaining INTEGER,
  monthly_limit INTEGER,
  current_usage INTEGER,
  period_end TIMESTAMPTZ,
  tier VARCHAR(20)
) AS $$
DECLARE
  quota_record RECORD;
BEGIN
  -- Get or create quota record
  SELECT * INTO quota_record FROM user_quotas WHERE user_id = p_user_id;
  
  -- If no record, create one with free tier defaults
  IF NOT FOUND THEN
    INSERT INTO user_quotas (user_id, tier, monthly_limit, current_usage)
    VALUES (p_user_id, 'free', 5, 0)
    RETURNING * INTO quota_record;
  END IF;
  
  -- Check if period needs reset
  IF quota_record.period_end < NOW() THEN
    UPDATE user_quotas
    SET current_usage = 0,
        period_start = date_trunc('month', NOW()),
        period_end = date_trunc('month', NOW()) + INTERVAL '1 month'
    WHERE user_id = p_user_id
    RETURNING * INTO quota_record;
  END IF;
  
  -- Return quota info
  RETURN QUERY SELECT
    (quota_record.is_unlimited OR 
     quota_record.current_usage < quota_record.monthly_limit + COALESCE(quota_record.extra_credits, 0))::BOOLEAN,
    (quota_record.monthly_limit + COALESCE(quota_record.extra_credits, 0) - quota_record.current_usage)::INTEGER,
    quota_record.monthly_limit,
    quota_record.current_usage,
    quota_record.period_end,
    quota_record.tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID, p_credits INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  quota_check RECORD;
BEGIN
  -- First check quota
  SELECT * INTO quota_check FROM check_user_quota(p_user_id);
  
  IF NOT quota_check.has_quota THEN
    RETURN FALSE;
  END IF;
  
  -- Increment usage
  UPDATE user_quotas
  SET current_usage = current_usage + p_credits,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset all quotas (for cron job)
CREATE OR REPLACE FUNCTION reset_expired_quotas()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE user_quotas
  SET current_usage = 0,
      period_start = date_trunc('month', NOW()),
      period_end = date_trunc('month', NOW()) + INTERVAL '1 month',
      updated_at = NOW()
  WHERE period_end < NOW();
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE quota_tiers ENABLE ROW LEVEL SECURITY;

-- Policies for ai_usage_log
CREATE POLICY "Users can view own usage logs"
  ON ai_usage_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage logs"
  ON ai_usage_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all usage logs
CREATE POLICY "Admins can view all usage logs"
  ON ai_usage_log FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('admin@photoai.com', 'duonghoang@gmail.com')
    )
  );

-- Policies for user_quotas
CREATE POLICY "Users can view own quota"
  ON user_quotas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all quotas"
  ON user_quotas FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('admin@photoai.com', 'duonghoang@gmail.com')
    )
  );

CREATE POLICY "Admins can update all quotas"
  ON user_quotas FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('admin@photoai.com', 'duonghoang@gmail.com')
    )
  );

-- Policies for quota_tiers (public read)
CREATE POLICY "Anyone can view active tiers"
  ON quota_tiers FOR SELECT
  USING (is_active = TRUE);

-- ============================================
-- 6. Grants
-- ============================================
GRANT SELECT, INSERT ON ai_usage_log TO authenticated;
GRANT SELECT ON user_quotas TO authenticated;
GRANT SELECT ON quota_tiers TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_user_quota TO authenticated;
GRANT EXECUTE ON FUNCTION increment_usage TO authenticated;

-- ============================================
-- 7. Usage Statistics View
-- ============================================
CREATE OR REPLACE VIEW user_usage_stats AS
SELECT
  u.user_id,
  u.tier,
  u.monthly_limit,
  u.current_usage,
  u.monthly_limit - u.current_usage AS remaining,
  u.period_end,
  u.is_unlimited,
  COALESCE(l.total_images, 0) AS total_images_processed,
  COALESCE(l.actions_count, 0) AS total_actions
FROM user_quotas u
LEFT JOIN (
  SELECT 
    user_id,
    SUM(images_count) AS total_images,
    COUNT(*) AS actions_count
  FROM ai_usage_log
  GROUP BY user_id
) l ON u.user_id = l.user_id;

GRANT SELECT ON user_usage_stats TO authenticated;

COMMENT ON VIEW user_usage_stats IS 'Combined view of user quotas and usage statistics';
