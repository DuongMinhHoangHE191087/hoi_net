#!/bin/bash

# Admin Panel Test Script
# This script helps verify that the admin panel is working correctly

echo "=========================================="
echo "🔍 Admin Panel Health Check"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
echo "1. Checking environment configuration..."
if [ -f .env.local ]; then
    echo -e "${GREEN}✓${NC} .env.local file exists"

    # Check for required env vars
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        echo -e "${GREEN}✓${NC} SUPABASE_SERVICE_ROLE_KEY is set"
    else
        echo -e "${RED}✗${NC} SUPABASE_SERVICE_ROLE_KEY is missing!"
        echo "   Add it to your .env.local file"
    fi

    if grep -q "NEXT_PUBLIC_ADMIN_EMAILS" .env.local; then
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_ADMIN_EMAILS is set"
        echo "   Admin emails: $(grep NEXT_PUBLIC_ADMIN_EMAILS .env.local | cut -d'=' -f2)"
    else
        echo -e "${YELLOW}⚠${NC}  NEXT_PUBLIC_ADMIN_EMAILS is not set"
        echo "   Using default from code"
    fi
else
    echo -e "${RED}✗${NC} .env.local file not found!"
    echo "   Copy .env.example to .env.local and fill in values"
fi

echo ""
echo "2. Checking file structure..."

# Check for admin API routes
if [ -f "app/api/admin/analytics/route.ts" ]; then
    echo -e "${GREEN}✓${NC} Admin Analytics API exists"
else
    echo -e "${RED}✗${NC} Admin Analytics API not found!"
fi

if [ -f "app/api/admin/requests/route.ts" ]; then
    echo -e "${GREEN}✓${NC} Admin Requests API exists"
else
    echo -e "${RED}✗${NC} Admin Requests API not found!"
fi

# Check for supabase-admin
if [ -f "lib/supabase-admin.ts" ]; then
    echo -e "${GREEN}✓${NC} Supabase Admin client exists"

    # Check if API routes use supabaseAdmin
    if grep -q "supabaseAdmin" app/api/admin/analytics/route.ts; then
        echo -e "${GREEN}✓${NC} Analytics API uses supabaseAdmin"
    else
        echo -e "${RED}✗${NC} Analytics API still uses old client!"
    fi
else
    echo -e "${RED}✗${NC} Supabase Admin client not found!"
fi

echo ""
echo "3. Checking admin components..."

if [ -f "components/admin/AdminAnalytics.tsx" ]; then
    echo -e "${GREEN}✓${NC} AdminAnalytics component exists"
else
    echo -e "${RED}✗${NC} AdminAnalytics component not found!"
fi

if [ -f "components/admin/AdminRequests.tsx" ]; then
    echo -e "${GREEN}✓${NC} AdminRequests component exists"
else
    echo -e "${RED}✗${NC} AdminRequests component not found!"
fi

echo ""
echo "4. Database migrations..."

migration_count=$(ls -1 database/migrations/*.sql 2>/dev/null | wc -l)
echo "   Found $migration_count migration files"

if [ -f "database/migrations/014_fix_admin_rls_policies.sql" ]; then
    echo -e "${GREEN}✓${NC} Migration 014 (Admin RLS) exists"

    # Check if it's the updated version
    if grep -q "gen_random_uuid" database/migrations/014_fix_admin_rls_policies.sql; then
        echo -e "${GREEN}✓${NC} Migration 014 uses gen_random_uuid() ✅"
    else
        echo -e "${YELLOW}⚠${NC}  Migration 014 uses old uuid_generate_v4()"
    fi

    # Check if system_logs is removed
    if grep -q "system_logs WHERE level = 'error'" database/migrations/014_fix_admin_rls_policies.sql; then
        echo -e "${RED}✗${NC} Migration 014 still queries system_logs!"
    else
        echo -e "${GREEN}✓${NC} Migration 014 doesn't depend on system_logs ✅"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Migration 014 not found"
fi

if [ -f "database/migrations/015_create_system_logs.sql" ]; then
    echo -e "${GREEN}✓${NC} Migration 015 (System Logs) exists (optional)"
else
    echo -e "${YELLOW}⚠${NC}  Migration 015 not found (optional)"
fi

echo ""
echo "=========================================="
echo "📋 Summary"
echo "=========================================="
echo ""
echo "To test the admin panel:"
echo "1. Run: npm run dev"
echo "2. Visit: http://localhost:3000/admin"
echo "3. Login with admin email from NEXT_PUBLIC_ADMIN_EMAILS"
echo ""
echo "To run database migrations:"
echo "1. Go to Supabase Dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Run migration 014_fix_admin_rls_policies.sql"
echo "4. (Optional) Run migration 015_create_system_logs.sql"
echo ""
echo "For detailed migration instructions:"
echo "See: database/migrations/README.md"
echo ""
echo "=========================================="
