#!/bin/bash

# Citrus Reach CSS Diagnostic Script
# Run this to diagnose why CSS isn't loading in production

echo "=================================================="
echo "Citrus Reach Production CSS Diagnostic"
echo "=================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "=== 1. Checking layout.tsx font declaration order ==="
if grep -q "export const dynamic = 'force-dynamic'" app/layout.tsx; then
    DYNAMIC_LINE=$(grep -n "export const dynamic" app/layout.tsx | cut -d: -f1)
    INTER_LINE=$(grep -n "const inter = Inter" app/layout.tsx | cut -d: -f1)
    
    if [ "$DYNAMIC_LINE" -lt "$INTER_LINE" ]; then
        print_status 0 "Font declaration order is CORRECT (export on line $DYNAMIC_LINE, font on line $INTER_LINE)"
    else
        print_status 1 "Font declaration order is WRONG (export on line $DYNAMIC_LINE, font on line $INTER_LINE)"
        echo "   FIX: Move 'export const dynamic' BEFORE 'const inter = Inter()'"
    fi
else
    print_warning "No 'export const dynamic' found - this might be OK depending on your setup"
fi
echo ""

echo "=== 2. Checking globals.css Tailwind directives ==="
if head -3 app/globals.css | grep -q "@tailwind base"; then
    print_status 0 "Tailwind directives found in globals.css"
else
    print_status 1 "Missing Tailwind directives in globals.css"
    echo "   First 3 lines should be:"
    echo "   @tailwind base;"
    echo "   @tailwind components;"
    echo "   @tailwind utilities;"
fi
echo ""

echo "=== 3. Checking PostCSS configuration ==="
if grep -q "tailwindcss" postcss.config.mjs; then
    print_status 0 "PostCSS configured with tailwindcss"
else
    print_status 1 "PostCSS missing tailwindcss plugin"
fi
echo ""

echo "=== 4. Checking Tailwind content paths ==="
echo "Current content paths:"
grep -A 8 "content:" tailwind.config.ts | grep -v "^--"
echo ""
echo "Checking if paths match actual file locations..."

# Check if app directory has tsx files
APP_FILES=$(find ./app -name "*.tsx" -o -name "*.jsx" 2>/dev/null | wc -l)
if [ $APP_FILES -gt 0 ]; then
    print_status 0 "Found $APP_FILES files in ./app directory"
else
    print_status 1 "No TSX/JSX files found in ./app directory"
fi

# Check if components directory has tsx files
COMP_FILES=$(find ./components -name "*.tsx" -o -name "*.jsx" 2>/dev/null | wc -l)
if [ $COMP_FILES -gt 0 ]; then
    print_status 0 "Found $COMP_FILES files in ./components directory"
else
    print_status 1 "No TSX/JSX files found in ./components directory"
fi
echo ""

echo "=== 5. Checking package.json dependencies ==="
if grep -q '"tailwindcss"' package.json; then
    TAILWIND_VERSION=$(grep '"tailwindcss"' package.json | sed 's/.*: "//;s/".*//')
    print_status 0 "tailwindcss installed: $TAILWIND_VERSION"
else
    print_status 1 "tailwindcss NOT found in package.json"
fi

if grep -q '"postcss"' package.json; then
    POSTCSS_VERSION=$(grep '"postcss"' package.json | sed 's/.*: "//;s/".*//')
    print_status 0 "postcss installed: $POSTCSS_VERSION"
else
    print_status 1 "postcss NOT found in package.json"
fi
echo ""

echo "=== 6. Checking .next build directory ==="
if [ -d ".next" ]; then
    print_status 0 ".next directory exists"
    
    # Check for CSS files
    CSS_COUNT=$(find .next/static/css -name "*.css" 2>/dev/null | wc -l)
    if [ $CSS_COUNT -gt 0 ]; then
        print_status 0 "Found $CSS_COUNT CSS file(s) in .next/static/css"
        echo "   CSS files:"
        ls -lh .next/static/css/*.css 2>/dev/null | awk '{print "   ", $9, "(" $5 ")"}'
        
        # Check CSS file sizes
        SMALL_CSS=$(find .next/static/css -name "*.css" -size -1k 2>/dev/null | wc -l)
        if [ $SMALL_CSS -gt 0 ]; then
            print_warning "$SMALL_CSS CSS file(s) are suspiciously small (<1KB)"
        fi
    else
        print_status 1 "NO CSS files found in .next/static/css - THIS IS THE PROBLEM!"
        echo "   CSS is not being generated during build"
    fi
else
    print_warning ".next directory doesn't exist - run 'npm run build' first"
fi
echo ""

echo "=== 7. Testing a build (this may take a minute) ==="
echo "Running: npm run build..."
BUILD_OUTPUT=$(npm run build 2>&1)
BUILD_EXIT=$?

if [ $BUILD_EXIT -eq 0 ]; then
    print_status 0 "Build completed successfully"
    
    # Check for CSS in build output
    if echo "$BUILD_OUTPUT" | grep -q "static/css"; then
        print_status 0 "CSS generation detected in build output"
    else
        print_status 1 "No CSS generation detected in build output"
    fi
else
    print_status 1 "Build FAILED"
    echo "Build errors:"
    echo "$BUILD_OUTPUT" | grep -i "error" | head -10
fi
echo ""

echo "=== 8. Checking for CSS Module conflicts ==="
MODULE_CSS=$(find . -name "*.module.css" -not -path "*/node_modules/*" -not -path "*/.next/*" | wc -l)
if [ $MODULE_CSS -gt 0 ]; then
    print_warning "Found $MODULE_CSS CSS Module file(s) - these might conflict with Tailwind"
    find . -name "*.module.css" -not -path "*/node_modules/*" -not -path "*/.next/*" | head -5
else
    print_status 0 "No CSS Module files found (good)"
fi
echo ""

echo "=== 9. Environment check ==="
echo "NODE_ENV: ${NODE_ENV:-not set}"
echo "Next.js version: $(grep '"next"' package.json | sed 's/.*: "//;s/".*//')"
echo "Package manager: $([ -f "pnpm-lock.yaml" ] && echo "pnpm" || ([ -f "package-lock.json" ] && echo "npm" || echo "yarn"))"
echo ""

echo "=================================================="
echo "Diagnostic Summary"
echo "=================================================="
echo ""
echo "If CSS files are NOT being generated (step 6 shows 0 files):"
echo "  1. Check font declaration order (step 1)"
echo "  2. Delete .next folder: rm -rf .next"
echo "  3. Clear cache and rebuild:"
echo "     - pnpm: pnpm store prune && pnpm install"
echo "     - npm: rm -rf node_modules package-lock.json && npm install"
echo "  4. Build again: npm run build"
echo ""
echo "If CSS files ARE generated but site is still unstyled:"
echo "  1. Check browser console for 404 errors on CSS files"
echo "  2. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)"
echo "  3. Check Vercel deployment settings match local environment"
echo ""
echo "Save this output and share it for further diagnosis if needed."
