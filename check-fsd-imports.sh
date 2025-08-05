#!/bin/bash

echo "Checking FSD import rules..."
echo "================================"

# Rule 1: Shared should not import from any higher layer
echo "Checking Rule 1: Shared layer violations..."
violations=$(find src/shared -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from '@/\(entities\|features\|widgets\|pages\|app\)" {} \;)
if [ -n "$violations" ]; then
  echo "❌ Found violations in shared layer:"
  echo "$violations"
else
  echo "✅ No violations in shared layer"
fi
echo ""

# Rule 2: Entities should not import from features, widgets, pages, or app
echo "Checking Rule 2: Entities layer violations..."
violations=$(find src/entities -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from '@/\(features\|widgets\|pages\|app\)" {} \;)
if [ -n "$violations" ]; then
  echo "❌ Found violations in entities layer:"
  echo "$violations"
else
  echo "✅ No violations in entities layer"
fi
echo ""

# Rule 3: Features should not import from widgets, pages, or app
echo "Checking Rule 3: Features layer violations..."
violations=$(find src/features -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from '@/\(widgets\|pages\|app\)" {} \;)
if [ -n "$violations" ]; then
  echo "❌ Found violations in features layer:"
  echo "$violations"
else
  echo "✅ No violations in features layer"
fi
echo ""

# Rule 4: Widgets should not import from pages or app
echo "Checking Rule 4: Widgets layer violations..."
violations=$(find src/widgets -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from '@/\(pages\|app\)" {} \;)
if [ -n "$violations" ]; then
  echo "❌ Found violations in widgets layer:"
  echo "$violations"
else
  echo "✅ No violations in widgets layer"
fi
echo ""

# Rule 5: Pages should not import from app
echo "Checking Rule 5: Pages layer violations..."
violations=$(find src/pages -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from '@/app" {} \;)
if [ -n "$violations" ]; then
  echo "❌ Found violations in pages layer:"
  echo "$violations"
else
  echo "✅ No violations in pages layer"
fi
echo ""

echo "Import check complete!"