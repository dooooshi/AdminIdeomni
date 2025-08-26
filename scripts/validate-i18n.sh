#!/bin/bash

# i18n Validation Script
# Checks for common i18n issues in the translation files

echo "🌍 Starting i18n validation..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Translation files
EN_FILE="src/lib/i18n/translations/en.ts"
ZH_FILE="src/lib/i18n/translations/zh.ts"
EN_EXT_FILE="src/lib/i18n/translations/en-extended.ts"
ZH_EXT_FILE="src/lib/i18n/translations/zh-extended.ts"

# Check if files exist
if [ ! -f "$EN_FILE" ] || [ ! -f "$ZH_FILE" ]; then
    echo -e "${RED}❌ Translation files not found!${NC}"
    exit 1
fi

echo "📋 Checking for duplicate keys..."
echo "================================"

# Check for duplicate keys in English
EN_DUPLICATES=$(grep -o "^  '[^']*':" "$EN_FILE" 2>/dev/null | sed "s/^  '//;s/'://" | sort | uniq -c | awk '$1 > 1')
if [ ! -z "$EN_DUPLICATES" ]; then
    echo -e "${RED}❌ Found duplicate keys in English:${NC}"
    echo "$EN_DUPLICATES"
    echo ""
else
    echo -e "${GREEN}✅ No duplicate keys in English${NC}"
fi

# Check for duplicate keys in Chinese
ZH_DUPLICATES=$(grep -o "^  '[^']*':" "$ZH_FILE" 2>/dev/null | sed "s/^  '//;s/'://" | sort | uniq -c | awk '$1 > 1')
if [ ! -z "$ZH_DUPLICATES" ]; then
    echo -e "${RED}❌ Found duplicate keys in Chinese:${NC}"
    echo "$ZH_DUPLICATES"
    echo ""
else
    echo -e "${GREEN}✅ No duplicate keys in Chinese${NC}"
fi

echo ""
echo "🔍 Checking for missing translations..."
echo "======================================="

# Extract keys from both files
grep -o "^  '[^']*':" "$EN_FILE" 2>/dev/null | sed "s/^  '//;s/'://" | sort > /tmp/en_keys.txt
grep -o "^  '[^']*':" "$ZH_FILE" 2>/dev/null | sed "s/^  '//;s/'://" | sort > /tmp/zh_keys.txt

# Find keys missing in Chinese
MISSING_IN_ZH=$(comm -23 /tmp/en_keys.txt /tmp/zh_keys.txt)
MISSING_IN_ZH_COUNT=$(echo "$MISSING_IN_ZH" | grep -c "^")

if [ "$MISSING_IN_ZH_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $MISSING_IN_ZH_COUNT keys in English missing in Chinese:${NC}"
    echo "$MISSING_IN_ZH" | head -20
    if [ "$MISSING_IN_ZH_COUNT" -gt 20 ]; then
        echo "... and $((MISSING_IN_ZH_COUNT - 20)) more"
    fi
    echo ""
else
    echo -e "${GREEN}✅ All English keys have Chinese translations${NC}"
fi

# Find keys missing in English
MISSING_IN_EN=$(comm -13 /tmp/en_keys.txt /tmp/zh_keys.txt)
MISSING_IN_EN_COUNT=$(echo "$MISSING_IN_EN" | grep -c "^" 2>/dev/null || echo "0")

if [ "$MISSING_IN_EN_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $MISSING_IN_EN_COUNT keys in Chinese missing in English:${NC}"
    echo "$MISSING_IN_EN" | head -20
    if [ "$MISSING_IN_EN_COUNT" -gt 20 ]; then
        echo "... and $((MISSING_IN_EN_COUNT - 20)) more"
    fi
    echo ""
else
    echo -e "${GREEN}✅ All Chinese keys have English translations${NC}"
fi

echo ""
echo "📏 Checking naming conventions..."
echo "================================="

# Check for inconsistent naming patterns (excluding namespace.UPPER_CASE patterns)
# This regex looks for camelCase within the key part after the namespace
MIXED_CASE=$(grep -o "^  '[^']*':" "$EN_FILE" 2>/dev/null | sed "s/^  '//;s/'://" | grep -E '\.[a-z]+[A-Z]')
MIXED_CASE_COUNT=$(echo "$MIXED_CASE" | grep -c "^" 2>/dev/null || echo "0")

if [ "$MIXED_CASE_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $MIXED_CASE_COUNT keys with mixed camelCase (consider using UPPER_SNAKE_CASE for consistency):${NC}"
    echo "$MIXED_CASE" | head -10
    if [ "$MIXED_CASE_COUNT" -gt 10 ]; then
        echo "... and $((MIXED_CASE_COUNT - 10)) more"
    fi
    echo ""
fi

# Check for keys without namespace
NO_NAMESPACE=$(grep -o "^  '[^']*':" "$EN_FILE" 2>/dev/null | sed "s/^  '//;s/'://" | grep -v "\.")
NO_NAMESPACE_COUNT=$(echo "$NO_NAMESPACE" | grep -c "^" 2>/dev/null || echo "0")

if [ "$NO_NAMESPACE_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}ℹ️  Found $NO_NAMESPACE_COUNT keys without namespace prefix (these are top-level keys):${NC}"
    echo "$NO_NAMESPACE" | head -5
    if [ "$NO_NAMESPACE_COUNT" -gt 5 ]; then
        echo "... and $((NO_NAMESPACE_COUNT - 5)) more"
    fi
else
    echo -e "${GREEN}✅ All keys have proper namespace prefixes${NC}"
fi
echo ""

echo ""
echo "📊 Statistics"
echo "============="

# Count total keys
EN_TOTAL=$(grep -c "^  '[^']*':" "$EN_FILE" 2>/dev/null || echo "0")
ZH_TOTAL=$(grep -c "^  '[^']*':" "$ZH_FILE" 2>/dev/null || echo "0")

echo "Total keys in English: $EN_TOTAL"
echo "Total keys in Chinese: $ZH_TOTAL"

# Check extended files if they exist
if [ -f "$EN_EXT_FILE" ] && [ -f "$ZH_EXT_FILE" ]; then
    EN_EXT_TOTAL=$(grep -c "^  '[^']*':" "$EN_EXT_FILE" 2>/dev/null || echo "0")
    ZH_EXT_TOTAL=$(grep -c "^  '[^']*':" "$ZH_EXT_FILE" 2>/dev/null || echo "0")
    echo "Extended keys in English: $EN_EXT_TOTAL"
    echo "Extended keys in Chinese: $ZH_EXT_TOTAL"
fi

# Clean up temp files
rm -f /tmp/en_keys.txt /tmp/zh_keys.txt

echo ""
echo "✨ i18n validation complete!"

# Summary
echo ""
if [ -z "$EN_DUPLICATES" ] && [ -z "$ZH_DUPLICATES" ] && [ "$MISSING_IN_ZH_COUNT" -eq 0 ] && [ "$MISSING_IN_EN_COUNT" -eq 0 ] && [ "$MIXED_CASE_COUNT" -eq 0 ]; then
    echo -e "${GREEN}🎉 Perfect! No i18n issues found.${NC}"
    exit 0
elif [ -z "$EN_DUPLICATES" ] && [ -z "$ZH_DUPLICATES" ] && [ "$MISSING_IN_ZH_COUNT" -le 1 ] && [ "$MISSING_IN_EN_COUNT" -le 1 ] && [ "$MIXED_CASE_COUNT" -le 1 ]; then
    echo -e "${GREEN}✨ Excellent! Only minor issues remaining.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some i18n issues need attention.${NC}"
    # Exit with error only for critical issues (duplicates or many missing translations)
    if [ ! -z "$EN_DUPLICATES" ] || [ ! -z "$ZH_DUPLICATES" ] || [ "$MISSING_IN_ZH_COUNT" -gt 5 ] || [ "$MISSING_IN_EN_COUNT" -gt 5 ]; then
        exit 1
    fi
fi

exit 0