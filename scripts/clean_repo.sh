#!/bin/bash

# App Factory Repository Cleanup Script
# Removes generated artifacts while preserving source code

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DRY_RUN="${CLEAN_DRY_RUN:-0}"

echo "=== App Factory Repository Cleanup ==="
echo "Repository: $REPO_ROOT"

if [ "$DRY_RUN" = "1" ]; then
    echo "DRY RUN MODE: Will only show what would be deleted"
    ACTION_PREFIX="[DRY RUN] Would delete:"
else
    ACTION_PREFIX="Deleting:"
fi

echo

# Define artifacts to clean
ARTIFACT_DIRS=(
    "runs"
    "builds" 
    "mobile"
)

ARTIFACT_PATTERNS=(
    ".cache"
    ".tmp"
    "tmp"
)

deleted_count=0

# Function to safely delete directory
safe_delete() {
    local target="$1"
    local full_path="$REPO_ROOT/$target"
    
    if [ -d "$full_path" ]; then
        echo "$ACTION_PREFIX $target/"
        if [ "$DRY_RUN" != "1" ]; then
            if ! rm -rf "$full_path"; then
                echo "ERROR: Failed to delete $target/"
                exit 1
            fi
        fi
        deleted_count=$((deleted_count + 1))
    fi
}

# Clean artifact directories
for dir in "${ARTIFACT_DIRS[@]}"; do
    safe_delete "$dir"
done

# Clean cache/temp patterns (only if they exist and look generated)
for pattern in "${ARTIFACT_PATTERNS[@]}"; do
    full_path="$REPO_ROOT/$pattern"
    if [ -d "$full_path" ]; then
        # Additional safety check - only delete if it looks like a cache/temp dir
        if [ -w "$full_path" ] && [ "$(find "$full_path" -name "*.log" -o -name "*.tmp" -o -name "*.cache" 2>/dev/null | wc -l)" -gt 0 ]; then
            safe_delete "$pattern"
        fi
    fi
done

echo

if [ $deleted_count -eq 0 ]; then
    echo "✓ Repository is already clean (no artifacts found)"
else
    if [ "$DRY_RUN" = "1" ]; then
        echo "✓ Would clean $deleted_count artifact directories"
        echo "  Run without CLEAN_DRY_RUN=1 to actually delete"
    else
        echo "✓ Cleaned $deleted_count artifact directories"
    fi
fi

echo
echo "Source directories preserved:"
echo "  ✓ templates/ - Stage execution templates"
echo "  ✓ schemas/ - JSON validation schemas" 
echo "  ✓ standards/ - Quality requirements"
echo "  ✓ runbooks/ - Documentation"
echo "  ✓ scripts/ - Utility scripts"

exit 0