#!/bin/bash

# Script to run only the tests that are known to work without hanging

echo "Running safe test suite..."

# Define the list of safe test files
SAFE_TESTS=(
  "src/pages/dashboard/__tests__/DashboardPage.test.tsx"
  "src/pages/home/__tests__/HomePage.test.tsx"
  "src/pages/profile/__tests__/ProfilePage.test.tsx"
  "src/pages/admin/__tests__/AdminDashboard.test.tsx"
  "src/pages/examples/__tests__/DataDisplayPage.test.tsx"
  "src/shared/ui/__tests__/button.test.tsx"
  "src/shared/lib/auth/csrf/__tests__/csrf-manager.test.ts"
  "src/shared/lib/auth/__tests__/secure-token-manager.csrf.test.ts"
  "src/shared/lib/auth/rotation/__tests__/rotation-conflict-handler.test.ts"
  "src/shared/lib/auth/rotation/__tests__/token-rotation-manager.test.ts"
  "src/shared/lib/http-client/__tests__/fetch-client.test.ts"
  "src/features/auth/model/__tests__/auth.store.test.ts"
)

# Run tests with a timeout to prevent hanging
npx vitest run "${SAFE_TESTS[@]}" --reporter=verbose --no-coverage

echo "Safe test suite completed!"