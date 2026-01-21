#!/bin/bash

echo "=================================="
echo "🔍 ADMIN PANEL QUICK CHECK"
echo "=================================="
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Dev server is NOT running!"
    echo "   Run: npm run dev"
    exit 1
fi

echo "✅ Dev server is running"
echo ""

# Check environment
echo "📋 Environment Check:"
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"

    if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        echo "✅ SUPABASE_SERVICE_ROLE_KEY is set"
    else
        echo "❌ SUPABASE_SERVICE_ROLE_KEY is MISSING!"
    fi

    if grep -q "NEXT_PUBLIC_ADMIN_EMAILS" .env.local; then
        admin_email=$(grep NEXT_PUBLIC_ADMIN_EMAILS .env.local | cut -d'=' -f2)
        echo "✅ Admin email: $admin_email"
    else
        echo "❌ NEXT_PUBLIC_ADMIN_EMAILS is MISSING!"
    fi
else
    echo "❌ .env.local NOT FOUND!"
fi

echo ""
echo "=================================="
echo "📝 NEXT STEPS:"
echo "=================================="
echo ""
echo "1. Open your browser console (F12)"
echo "2. Go to: http://localhost:3000/admin"
echo "3. Look for these logs:"
echo "   - [AdminAnalytics] useEffect triggered"
echo "   - [AdminAnalytics] All checks passed"
echo "   - [AdminAnalytics] Starting fetch"
echo ""
echo "4. If you see errors, copy ALL console logs"
echo "5. Also check Network tab for failed requests"
echo ""
echo "OR test the debug page:"
echo "   http://localhost:3000/admin-debug"
echo ""
