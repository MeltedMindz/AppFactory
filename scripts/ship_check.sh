#!/bin/bash

# App Factory Ship Readiness Check
# Verifies repository is clean and ready for distribution

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== App Factory Ship Readiness Check ==="
echo "Repository: $REPO_ROOT"
echo

failed_checks=0

# Check: No generated artifact directories
echo "Checking for generated artifacts..."
for dir in "runs" "builds" "mobile"; do
    if [ -d "$REPO_ROOT/$dir" ]; then
        echo "  ❌ Found $dir/ directory (should be cleaned)"
        failed_checks=$((failed_checks + 1))
    else
        echo "  ✓ $dir/ directory not present"
    fi
done

# Check: No .env files (except .env.example)
echo
echo "Checking environment files..."
env_files=$(find "$REPO_ROOT" -maxdepth 2 -name ".env*" ! -name ".env.example" 2>/dev/null || true)
if [ -n "$env_files" ]; then
    echo "  ❌ Found environment files that should not be committed:"
    echo "$env_files" | sed 's/^/    /'
    failed_checks=$((failed_checks + 1))
else
    echo "  ✓ No problematic .env files found"
fi

# Check: Git status (if git is available and this is a git repo)
if command -v git >/dev/null 2>&1 && [ -d "$REPO_ROOT/.git" ]; then
    echo
    echo "Checking git status..."
    cd "$REPO_ROOT"
    
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        echo "  ⚠️ Git working directory has uncommitted changes"
        echo "     This may include artifacts that should be cleaned"
        # Don't fail on this - just warn
    else
        echo "  ✓ Git working directory is clean"
    fi
fi

# Summary
echo
if [ $failed_checks -eq 0 ]; then
    echo "🚀 Repository is ship-ready!"
    echo "   All checks passed - safe to distribute"
    exit 0
else
    echo "❌ Repository is NOT ship-ready"
    echo "   $failed_checks check(s) failed"
    echo "   Run: scripts/clean_repo.sh"
    exit 1
fi