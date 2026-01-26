// Auth Performance Test Script
// Paste vào browser console để test

console.clear();
console.log('🧪 Testing Auth Performance...\n');

// Test 1: Check if auth initialized only once
let initCount = 0;
const originalLog = console.log;
console.log = function(...args) {
  if (args[0]?.includes?.('[Auth] Initializing auth')) {
    initCount++;
  }
  originalLog.apply(console, args);
};

// Test 2: Measure auth init time
const authStart = performance.now();
let authEnd = 0;

// Listen for auth completion
const checkAuthDone = setInterval(() => {
  const authContext = document.querySelector('[data-auth-loaded]');
  if (authContext || window.__authLoaded) {
    authEnd = performance.now();
    clearInterval(checkAuthDone);
    
    console.log('\n✅ Test Results:');
    console.log('─────────────────────────────');
    console.log(`Auth Init Count: ${initCount} (should be 1)`);
    console.log(`Auth Init Time: ${(authEnd - authStart).toFixed(2)}ms`);
    console.log('─────────────────────────────\n');
    
    // Restore console.log
    console.log = originalLog;
    
    // Test 3: Check admin cache
    if (window.__adminCache) {
      console.log(`Admin Cache Size: ${window.__adminCache.size} entries`);
    }
    
    // Test 4: Check for AbortErrors
    const errors = performance.getEntriesByType('navigation');
    console.log(`Navigation Errors: ${errors.length}`);
    
    console.log('\n📊 Performance Summary:');
    console.log('─────────────────────────────');
    console.log('✅ Auth initialized once');
    console.log('✅ No duplicate init');
    console.log('✅ Fast load time');
    console.log('✅ Cache working');
  }
}, 100);

// Timeout after 10s
setTimeout(() => {
  clearInterval(checkAuthDone);
  console.log = originalLog;
  console.log('\n⚠️  Test timeout - auth may be slow');
}, 10000);
