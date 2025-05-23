#!/bin/bash
# AEGIS - Enhanced Versioning Script
# Provides consistent versioning across all project components

set -e

# Detect working directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"

# Default action
ACTION=${1:-show}

# Get the current git tag, commit hash, and check for dirty state
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
COMMIT_COUNT=$(git rev-list --count ${LATEST_TAG}..HEAD 2>/dev/null || echo "0")
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Check if working directory is dirty
if ! git diff --quiet 2>/dev/null; then
  DIRTY="-dirty"
  IS_DIRTY=true
else
  DIRTY=""
  IS_DIRTY=false
fi

# Calculate version components
MAJOR=$(echo $LATEST_TAG | sed 's/v\([0-9]*\)\..*/\1/')
MINOR=$(echo $LATEST_TAG | sed 's/v[0-9]*\.\([0-9]*\)\..*/\1/')
PATCH=$(echo $LATEST_TAG | sed 's/v[0-9]*\.[0-9]*\.\([0-9]*\).*/\1/')

# Format full version string
if [ "$COMMIT_COUNT" -gt "0" ]; then
  FULL_VERSION="${LATEST_TAG}-${COMMIT_COUNT}-g${COMMIT_HASH}${DIRTY}"
else
  FULL_VERSION="${LATEST_TAG}${DIRTY}"
fi

# Strip the 'v' prefix for some uses
VERSION_NO_V=$(echo $FULL_VERSION | sed 's/^v//')

case $ACTION in
  show)
    echo $FULL_VERSION
    ;;

  json)
    echo "{\"version\":\"$VERSION_NO_V\",\"buildDate\":\"$BUILD_DATE\",\"gitCommit\":\"$COMMIT_HASH\",\"dirty\":$IS_DIRTY}"
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
    # Apply version information to all project components
    echo "Applying version information across project..."
    
    # Frontend version file
    mkdir -p frontend/src/assets
    cat > frontend/src/assets/version.json << EOF
{
  "version": "$VERSION_NO_V",
  "buildTimestamp": "$BUILD_DATE",
  "gitCommit": "$COMMIT_HASH",
  "dirty": $IS_DIRTY
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
	Version = "$VERSION_NO_V"
	
	// BuildTimestamp is the time the build was created
	BuildTimestamp = "$BUILD_DATE"
	
	// GitCommit is the git commit hash
	GitCommit = "$COMMIT_HASH"
	
	// IsDirty indicates if the build was created with uncommitted changes
	IsDirty = $IS_DIRTY
)
EOF
    echo "- Updated backend/internal/config/version.go"
    
    # Update package.json version (frontend)
    if [ -f frontend/package.json ]; then
      # Use temporary file to avoid issues with some sed implementations
      sed "s/\"version\": \".*\"/\"version\": \"$VERSION_NO_V\"/" frontend/package.json > frontend/package.json.tmp
      mv frontend/package.json.tmp frontend/package.json
      echo "- Updated version in frontend/package.json"
    fi
    
    # Create version file at project root
    echo "$FULL_VERSION" > "$ROOT_DIR/VERSION"
    echo "- Created VERSION file at project root"
    
    echo "Version information applied successfully: $FULL_VERSION"
    ;;

  info)
    # Display detailed version information
    echo "AEGIS Version Information:"
    echo "-------------------------"
    echo "Version:      $FULL_VERSION"
    echo "Major:        $MAJOR"
    echo "Minor:        $MINOR"
    echo "Patch:        $PATCH"
    echo "Commit Hash:  $COMMIT_HASH"
    echo "Commit Count: $COMMIT_COUNT (since $LATEST_TAG)"
    echo "Build Date:   $BUILD_DATE"
    echo "Dirty:        $([ "$IS_DIRTY" = "true" ] && echo "Yes" || echo "No")"
    echo "-------------------------"
    ;;

  *)
    echo "Usage: $0 [show|json|major|minor|patch|apply|info]"
    echo ""
    echo "  show   - Display current version (default)"
    echo "  json   - Output version info as JSON"
    echo "  major  - Increment major version"
    echo "  minor  - Increment minor version" 
    echo "  patch  - Increment patch version"
    echo "  apply  - Apply version information to project files"
    echo "  info   - Display detailed version information"
    exit 1
    ;;
esac