#!/bin/bash
# generate-changelog.sh - Generate a changelog from git commits

set -e

# Get the previous and current versions
PREVIOUS_TAG=$(git describe --tags --abbrev=0 --exclude=$(git describe --tags --abbrev=0) 2>/dev/null || git rev-list --max-parents=0 HEAD)
CURRENT_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "HEAD")

# Output file
CHANGELOG_FILE="CHANGELOG.md"

# Generate changelog header
if [ "$CURRENT_TAG" == "HEAD" ]; then
  echo "# Changelog for Unreleased Changes" > $CHANGELOG_FILE
  RANGE="$PREVIOUS_TAG..HEAD"
else
  echo "# Changelog for $CURRENT_TAG" > $CHANGELOG_FILE
  echo "" >> $CHANGELOG_FILE
  echo "Released on: $(git log -1 --format=%ai $CURRENT_TAG)" >> $CHANGELOG_FILE
  RANGE="$PREVIOUS_TAG..$CURRENT_TAG"
fi

echo "" >> $CHANGELOG_FILE
echo "## Changes since $PREVIOUS_TAG" >> $CHANGELOG_FILE
echo "" >> $CHANGELOG_FILE

# Function to extract and format commits of a certain type
function extract_commits {
  local type=$1
  local header=$2
  
  # Get all commits of this type
  local commits=$(git log $RANGE --format="%s" | grep "^$type" || true)
  
  # If we have commits of this type, add them to the changelog
  if [ ! -z "$commits" ]; then
    echo "### $header" >> $CHANGELOG_FILE
    echo "" >> $CHANGELOG_FILE
    
    # Format each commit
    git log $RANGE --format="* %s (%h) - %an" | grep "^* $type" | sed "s/^* $type: //" >> $CHANGELOG_FILE
    
    echo "" >> $CHANGELOG_FILE
  fi
}

# Extract different types of changes
extract_commits "feat" "New Features"
extract_commits "fix" "Bug Fixes"
extract_commits "perf" "Performance Improvements"
extract_commits "refactor" "Code Refactoring"
extract_commits "docs" "Documentation"
extract_commits "test" "Tests"
extract_commits "chore" "Maintenance"

# Add other commits that don't match a specific type
echo "### Other Changes" >> $CHANGELOG_FILE
echo "" >> $CHANGELOG_FILE
git log $RANGE --format="* %s (%h) - %an" | grep -v "^* feat" | grep -v "^* fix" | grep -v "^* perf" | grep -v "^* refactor" | grep -v "^* docs" | grep -v "^* test" | grep -v "^* chore" >> $CHANGELOG_FILE

echo "Changelog generated: $CHANGELOG_FILE"