#!/bin/bash

# Token Rotation Test Runner
# Runs all token rotation related tests with detailed output

echo "🔄 Token Rotation Test Suite"
echo "============================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test files
TEST_FILES=(
  "src/shared/lib/auth/rotation/__tests__/token-rotation-manager.test.ts"
  "src/shared/lib/auth/rotation/__tests__/rotation-conflict-handler.test.ts"
  "src/shared/lib/auth/rotation/__tests__/token-rotation.integration.test.ts"
)

# Run tests with coverage
echo "Running token rotation tests with coverage..."
echo ""

# Check if we should run a specific test file
if [ "$1" ]; then
  echo -e "${YELLOW}Running specific test: $1${NC}"
  npm run test -- "$1" --coverage
else
  # Run all token rotation tests
  echo -e "${YELLOW}Running all token rotation tests...${NC}"
  
  # Build the test pattern
  TEST_PATTERN=""
  for file in "${TEST_FILES[@]}"; do
    if [ -z "$TEST_PATTERN" ]; then
      TEST_PATTERN="$file"
    else
      TEST_PATTERN="$TEST_PATTERN|$file"
    fi
  done
  
  # Run tests
  npm run test -- --coverage --coverage.include="src/shared/lib/auth/rotation/**" "${TEST_FILES[@]}"
fi

# Check test results
if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ All token rotation tests passed!${NC}"
  echo ""
  echo "Test Summary:"
  echo "- TokenRotationManager: Unit tests for rotation scheduling and retry logic"
  echo "- RotationConflictHandler: Unit tests for cross-tab synchronization"
  echo "- Integration Tests: End-to-end token rotation scenarios"
  echo ""
  echo "Coverage report generated in coverage/ directory"
else
  echo ""
  echo -e "${RED}❌ Some tests failed. Please check the output above.${NC}"
  exit 1
fi

# Optional: Run specific test scenarios
if [ "$2" = "--scenarios" ]; then
  echo ""
  echo -e "${YELLOW}Running specific test scenarios...${NC}"
  echo ""
  
  # Test automatic rotation
  echo "1. Testing automatic token rotation..."
  npm run test -- -t "should automatically rotate access token before expiry" --no-coverage
  
  echo ""
  echo "2. Testing multi-tab conflict handling..."
  npm run test -- -t "should prevent concurrent rotations across tabs" --no-coverage
  
  echo ""
  echo "3. Testing network failure recovery..."
  npm run test -- -t "should retry rotation on network failure" --no-coverage
fi

echo ""
echo "To run specific tests:"
echo "  ./scripts/test-token-rotation.sh <test-file>"
echo ""
echo "To run test scenarios:"
echo "  ./scripts/test-token-rotation.sh --scenarios"
echo ""