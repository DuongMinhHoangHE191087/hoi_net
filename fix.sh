#!/bin/bash

# 🔧 Auto Fix Script
# Kiểm tra và hướng dẫn fix các vấn đề

echo "🔍 Checking for issues..."
echo ""

# Check if .next exists
if [ -d ".next" ]; then
  echo "✅ Build cache exists"
else
  echo "⚠️  Build cache missing - will be created on next dev"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
  echo "✅ Dependencies installed"
else
  echo "❌ Dependencies missing!"
  echo "   Run: npm install"
  exit 1
fi

# Check if .env.local exists
if [ -f ".env.local" ]; then
  echo "✅ Environment variables configured"
else
  echo "❌ .env.local missing!"
  echo "   Please create .env.local with Supabase credentials"
  exit 1
fi

echo ""
echo "📊 Quick fixes available:"
echo ""
echo "1️⃣  Clear build cache:"
echo "   rm -rf .next && npm run dev"
echo ""
echo "2️⃣  Kill port 3000:"
echo "   npx kill-port 3000"
echo ""
echo "3️⃣  Check database:"
echo "   npm run check-db"
echo ""
echo "4️⃣  Fix database (if needed):"
echo "   Open Supabase → SQL Editor → Run FIX-ALL-DATABASE-TABLES.sql"
echo ""
echo "5️⃣  Hard reload browser:"
echo "   Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo ""
echo "✨ All checks passed! If you still see errors, check:"
echo "   1. Browser console (F12)"
echo "   2. Dev server output"
echo "   3. Database in Supabase Dashboard"
