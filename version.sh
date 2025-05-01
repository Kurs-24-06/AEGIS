#!/bin/bash
# version.sh - Generate and manage version information for AEGIS

set -e

# Detect if we're in a git repository
if [ ! -d ".git" ]; then
  echo "Error: Not in a git repository root" >&2
  exit 1
fi

# Get the most recent tag
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")

# Parse the version components
MAJOR=$(echo $LATEST_TAG | sed 's/v\([0-9]*\)\..*/\1/')
MINOR=$(echo $LATEST_TAG | sed 's/v[0-9]*\.\([0-9]*\)\..*/\1/')
PATCH=$(echo $LATEST_TAG | sed 's/v[0-9]*\.[0-9]*\.\([0-9]*\).*/\1/')

# Get the commit count since the last tag
COMMIT_COUNT=$(git rev-list --count ${LATEST_TAG}..HEAD)

# Get the short git hash
GIT_HASH=$(git rev-parse --short HEAD)

# Check if working directory is dirty
if ! git diff --quiet; then
  DIRTY="-dirty"
else
  DIRTY=""
fi

# Default action is to show the current version
ACTION=${1:-show}

case $ACTION in
  show)
    # If we have commits since the last tag, include them in the version
    if [ "$COMMIT_COUNT" -gt "0" ]; then
      FULL_VERSION="${LATEST_TAG}-${COMMIT_COUNT}-g${GIT_HASH}${DIRTY}"
    else
      FULL_VERSION="${LATEST_TAG}${DIRTY}"
    fi
    echo $FULL_VERSION
    ;;

  major)
    # Increment major version, reset minor and patch
    NEW_MAJOR=$((MAJOR + 1))
    NEW_TAG="v${NEW_MAJOR}.0.0"
    git tag -a $NEW_TAG -m "Release $NEW_TAG"
    echo "Created new major version: $NEW_TAG"
    ;;

  minor)
    # Increment minor version, reset patch
    NEW_MINOR=$((MINOR + 1))
    NEW_TAG="v${MAJOR}.${NEW_MINOR}.0"
    git tag -a $NEW_TAG -m "Release $NEW_TAG"
    echo "Created new minor version: $NEW_TAG"
    ;;

  patch)
    # Increment patch version
    NEW_PATCH=$((PATCH + 1))
    NEW_TAG="v${MAJOR}.${MINOR}.${NEW_PATCH}"
    git tag -a $NEW_TAG -m "Release $NEW_TAG"
    echo "Created new patch version: $NEW_TAG"
    ;;

  apply)
    # Apply version information to project files
    echo "Applying version information..."
    
    # Strip leading 'v' if present
    VERSION=$(echo $FULL_VERSION | sed 's/^v//')
    BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Frontend version file
    mkdir -p frontend/src/assets
    cat > frontend/src/assets/version.json << EOF
{
  "version": "$VERSION",
  "buildTimestamp": "$BUILD_DATE",
  "gitCommit": "$GIT_HASH"
}
EOF
    echo "- Updated frontend/src/assets/version.json"
    
    # Backend version file
    mkdir -p backend/internal/config
    cat > backend/internal/config/version.go << EOF
package config

// Auto-generated version information
const (
	// Version is the current application version
	Version = "$VERSION"
	
	// BuildTimestamp is the time the build was created
	BuildTimestamp = "$BUILD_DATE"
	
	// GitCommit is the git commit hash
	GitCommit = "$GIT_HASH"
)
EOF
    echo "- Updated backend/internal/config/version.go"
    
    echo "Version information applied successfully."
    ;;

  *)
    echo "Usage: $0 [show|major|minor|patch|apply]"
    echo ""
    echo "  show   - Display current version (default)"
    echo "  major  - Increment major version"
    echo "  minor  - Increment minor version"
    echo "  patch  - Increment patch version"
    echo "  apply  - Apply version information to project files"
    exit 1
    ;;
esac