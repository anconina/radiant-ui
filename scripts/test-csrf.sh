#!/bin/bash

echo "🔐 Running CSRF Validation Tests..."
echo "=================================="

# Run CSRF Manager tests
echo "📋 Testing CSRF Manager..."
npm run test -- src/shared/lib/auth/csrf/__tests__/csrf-manager.test.ts

# Run API Client CSRF integration tests
echo "🌐 Testing API Client CSRF Integration..."
npm run test -- src/shared/lib/api/__tests__/client.csrf.test.ts

# Run SecureTokenManager CSRF tests
echo "🔒 Testing SecureTokenManager CSRF Integration..."
npm run test -- src/shared/lib/auth/__tests__/secure-token-manager.csrf.test.ts

echo "=================================="
echo "✅ CSRF tests completed!"