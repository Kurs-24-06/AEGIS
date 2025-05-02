#!/bin/bash
# AEGIS Project Validation Script
# Checks for common issues and ensures project structure integrity

set -e

echo "🔍 Validating AEGIS project structure..."

# Check for required directories
echo "Checking required directories..."
for dir in "frontend" "backend" "infra" "deploy" "monitoring"; do
  if [ ! -d "$dir" ]; then
    echo "❌ Error: Required directory '$dir' not found"
    exit 1
  fi
done
echo "✅ All required directories exist"

# Check for essential files
echo "Checking essential files..."
ESSENTIAL_FILES=(
  "README.md"
  "frontend/package.json"
  "frontend/src/main.ts"
  "backend/go.mod"
  "backend/cmd/main.go"
  "infra/aws/main.tf"
  "infra/azure/main.tf"
  ".github/workflows/ci.yml"
)

for file in "${ESSENTIAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Error: Essential file '$file' not found"
    exit 1
  fi
done
echo "✅ All essential files exist"

# Validate syntax of important files
echo "Validating syntax of important files..."

# Validate package.json
if ! jq . frontend/package.json > /dev/null 2>&1; then
  echo "❌ Error: Invalid JSON in frontend/package.json"
  exit 1
fi

# Validate go.mod (basic check)
if ! grep -q "^module " backend/go.mod; then
  echo "❌ Error: Invalid go.mod file (missing module directive)"
  exit 1
fi

# Validate yaml files (basic check)
for yaml_file in ".github/workflows/ci.yml" "deploy/environments/dev/config.yml"; do
  if [ -f "$yaml_file" ] && ! python3 -c "import yaml, sys; yaml.safe_load(open('$yaml_file'))" > /dev/null 2>&1; then
    echo "❌ Error: Invalid YAML in $yaml_file"
    exit 1
  fi
done

# Check for version inconsistencies
echo "Checking version information..."
FRONTEND_VERSION=$(grep '"version":' frontend/package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[:space:]')
if [ "$FRONTEND_VERSION" != "0.0.0" ] && [ -z "$FRONTEND_VERSION" ]; then
  echo "⚠️ Warning: Missing version in frontend/package.json"
fi

# Check for common issues in Docker files
echo "Checking Docker files..."
if [ -f "frontend/Dockerfile" ] && ! grep -q "EXPOSE" frontend/Dockerfile; then
  echo "⚠️ Warning: Missing EXPOSE directive in frontend/Dockerfile"
fi

if [ -f "backend/Dockerfile" ] && ! grep -q "EXPOSE" backend/Dockerfile; then
  echo "⚠️ Warning: Missing EXPOSE directive in backend/Dockerfile"
fi

# Check for linting configurations
echo "Checking linting configurations..."
if [ ! -f "frontend/.eslintrc.js" ] && [ ! -f "frontend/eslint.config.js" ]; then
  echo "⚠️ Warning: Missing ESLint configuration in frontend/"
fi

# Validate .prettierrc.js if it exists
if [ -f "frontend/.prettierrc.js" ]; then
  if ! node -e "try { require('./frontend/.prettierrc.js'); } catch(e) { console.error(e); process.exit(1); }" > /dev/null 2>&1; then
    echo "❌ Error: Invalid .prettierrc.js file"
    exit 1
  fi
  echo "✅ .prettierrc.js is valid"
fi

echo "🎉 Project validation completed successfully!"