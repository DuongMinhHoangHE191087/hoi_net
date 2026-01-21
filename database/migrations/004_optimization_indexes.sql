-- Optimizing AI Usage Log Queries
-- Used for getQuotaInfo(), checkQuota(), and admin analytics
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_request_id ON ai_usage_log(request_id);

-- Optimizing User Requests Queries
-- Used for listing requests in dashboard and admin panel
CREATE INDEX IF NOT EXISTS idx_requests_user_status ON user_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON user_requests(created_at DESC);

-- Optimizing AI Cache Lookups (covered in 003 but good to reinforce)
CREATE INDEX IF NOT EXISTS idx_ai_cache_hash ON ai_analysis_cache(image_hash, prompt_hash);

-- General Perf
COMMENT ON INDEX idx_ai_usage_user_date IS 'Speeds up quota calculation for current user';
COMMENT ON INDEX idx_requests_user_status IS 'Speeds up fetching user request history';
