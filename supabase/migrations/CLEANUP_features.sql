-- CLEANUP SCRIPT - Chạy script này NẾU migration chính vẫn bị lỗi
-- Sau khi chạy cleanup, chạy lại migration chính

-- Drop existing table and all dependencies
DROP TABLE IF EXISTS features CASCADE;

-- Now you can run the main migration file: 003_features_and_team_fixes.sql
