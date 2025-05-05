#!/bin/bash
# AEGIS Project Setup Script
# This script sets up the project with proper versioning and environment configuration

set -e

# Detect working directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"

# Create necessary directories
mkdir -p "$ROOT_DIR/environments"
mkdir -p "$ROOT_DIR/frontend/src/environments"
mkdir -p "$ROOT_DIR/backend/config"
mkdir -p "$ROOT_DIR/infra/aws/env"
mkdir -p "$ROOT_DIR/infra/azure/env"
mkdir -p "$ROOT_DIR/deploy/environments/dev"
mkdir -p "$ROOT_DIR/deploy/environments/staging"
mkdir -p "$ROOT_DIR/deploy/environments/prod"

# Make scripts executable
chmod +x "$ROOT_DIR/version.sh"
chmod +x "$ROOT_DIR/env-config.sh"

# Apply version information
"$ROOT_DIR/version.sh" apply

# Create environment files if they don't exist
for env in dev staging prod; do
  env_file="$ROOT_DIR/environments/$env.env"
  
  if [ ! -f "$env_file" ]; then
    echo "Creating $env environment file..."
    "$ROOT_DIR/env-config.sh" "$env"
  fi
done

# Apply development environment configuration
"$ROOT_DIR/env-config.sh" dev apply

# Update package.json scripts
if [ -f "$ROOT_DIR/frontend/package.json" ]; then
  echo "Updating package.json scripts..."
  
  # Check if jq is installed
  if command -v jq > /dev/null; then
    # Add or update version-related scripts using jq
    jq '.scripts |= . + {
      "version:show": "../version.sh show",
      "version:apply": "../version.sh apply",
      "version:info": "../version.sh info",
      "env:dev": "../env-config.sh dev apply",
      "env:staging": "../env-config.sh staging apply",
      "env:prod": "../env-config.sh prod apply",
      "env:show": "../env-config.sh dev show"
    }' "$ROOT_DIR/frontend/package.json" > "$ROOT_DIR/frontend/package.json.tmp"
    mv "$ROOT_DIR/frontend/package.json.tmp" "$ROOT_DIR/frontend/package.json"
    echo "Updated frontend/package.json scripts"
  else
    echo "jq not installed, skipping package.json update"
    echo "You can manually add the following scripts to frontend/package.json:"
    echo "  \"version:show\": \"../version.sh show\","
    echo "  \"version:apply\": \"../version.sh apply\","
    echo "  \"version:info\": \"../version.sh info\","
    echo "  \"env:dev\": \"../env-config.sh dev apply\","
    echo "  \"env:staging\": \"../env-config.sh staging apply\","
    echo "  \"env:prod\": \"../env-config.sh prod apply\","
    echo "  \"env:show\": \"../env-config.sh dev show\""
  fi
fi

# Update makefile targets
if [ -f "$ROOT_DIR/makefile" ]; then
  echo "Updating makefile..."
  
  makefile="$ROOT_DIR/makefile"
  
  # Check if version targets already exist
  if ! grep -q "^version:" "$makefile"; then
    # Add version targets
    cat >> "$makefile" << 'EOF'

# Version management
version:
	@./version.sh show

version-apply:
	@./version.sh apply

version-info:
	@./version.sh info

version-patch:
	@./version.sh patch
	@./version.sh apply

version-minor:
	@./version.sh minor
	@./version.sh apply

version-major:
	@./version.sh major
	@./version.sh apply

# Environment management
env-dev:
	@./env-config.sh dev apply

env-staging:
	@./env-config.sh staging apply

env-prod:
	@./env-config.sh prod apply

env-show:
	@./env-config.sh $(ENV) show
EOF
    echo "Added version and environment targets to makefile"
  else
    echo "Version targets already exist in makefile, skipping"
  fi
fi

# Update .github/workflows/ci.yml if it exists
if [ -f "$ROOT_DIR/.github/workflows/ci.yml" ]; then
  echo "Updating CI workflow..."
  
  workflow="$ROOT_DIR/.github/workflows/ci.yml"
  
  # Check if version step already exists
  if ! grep -q "version.sh" "$workflow"; then
    echo "Version step not found in CI workflow"
    echo "Please manually update the CI workflow to set version using ./version.sh"
    echo "Example:"
    echo "  - name: Set version"
    echo "    run: |"
    echo "      echo \"VERSION=\$(./version.sh)\" >> \$GITHUB_ENV"
    echo "      ./version.sh apply"
  else
    echo "Version step already exists in CI workflow"
  fi
fi

# Create git hooks directory if it doesn't exist
mkdir -p "$ROOT_DIR/.git/hooks"

# Create pre-commit hook
cat > "$ROOT_DIR/.git/hooks/pre-commit" << 'EOF'
#!/bin/bash
# AEGIS pre-commit hook
# Ensures version info is up-to-date and validation passes

# Apply version information
./version.sh apply

# Validate project structure
if [ -f "./validate.sh" ]; then
  ./validate.sh
  if [ $? -ne 0 ]; then
    echo "Validation failed, commit aborted"
    exit 1
  fi
fi

# Add version files to the commit
git add VERSION frontend/src/assets/version.json backend/internal/config/version.go
EOF

# Make hook executable
chmod +x "$ROOT_DIR/.git/hooks/pre-commit"
echo "Created pre-commit hook to update version information"

# Create post-checkout hook
cat > "$ROOT_DIR/.git/hooks/post-checkout" << 'EOF'
#!/bin/bash
# AEGIS post-checkout hook
# Updates environment configuration after checkout

# Only run on branch checkout, not file checkout
if [ "$3" = "1" ]; then
  # Apply development environment configuration
  ./env-config.sh dev apply
fi
EOF

# Make hook executable
chmod +x "$ROOT_DIR/.git/hooks/post-checkout"
echo "Created post-checkout hook to update environment configuration"

# Display summary
echo "============================================================"
echo "AEGIS Project Setup Complete"
echo "============================================================"
echo "Current version: $(./version.sh show)"
echo "Current environment: $(./env-config.sh dev show | grep ENVIRONMENT | cut -d '=' -f 2)"
echo ""
echo "Next steps:"
echo "1. Review environment files in environments/"
echo "2. Update environment-specific values"
echo "3. Run './version.sh apply' before committing changes"
echo "4. Use 'make version' to view current version"
echo "5. Use 'make env-dev', 'make env-staging', or 'make env-prod' to apply environments"
echo "============================================================"