#!/bin/bash

# Conventional Commit Helper Script
# Makes it easy to create properly formatted commits

echo "🚀 Conventional Commit Helper"
echo "=============================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Select commit type
echo -e "${BLUE}Select commit type:${NC}"
echo "1) feat     - New feature"
echo "2) fix      - Bug fix"
echo "3) docs     - Documentation"
echo "4) style    - Code style/formatting"
echo "5) refactor - Code refactoring"
echo "6) perf     - Performance improvement"
echo "7) test     - Adding tests"
echo "8) chore    - Maintenance"
echo ""
read -p "Enter number (1-8): " type_choice

case $type_choice in
    1) TYPE="feat";;
    2) TYPE="fix";;
    3) TYPE="docs";;
    4) TYPE="style";;
    5) TYPE="refactor";;
    6) TYPE="perf";;
    7) TYPE="test";;
    8) TYPE="chore";;
    *) echo "Invalid choice"; exit 1;;
esac

# Ask for scope (optional)
echo ""
read -p "Scope (optional, press Enter to skip): " SCOPE

# Ask for subject
echo ""
read -p "Subject (brief description): " SUBJECT

if [ -z "$SUBJECT" ]; then
    echo -e "${YELLOW}Subject cannot be empty!${NC}"
    exit 1
fi

# Ask for body (optional)
echo ""
echo "Body (optional, press Enter to skip, Ctrl+D when done):"
BODY=$(cat)

# Ask if breaking change
echo ""
read -p "Is this a breaking change? (y/N): " BREAKING

# Construct commit message
if [ -n "$SCOPE" ]; then
    if [ "$BREAKING" = "y" ] || [ "$BREAKING" = "Y" ]; then
        COMMIT_MSG="${TYPE}(${SCOPE})!: ${SUBJECT}"
    else
        COMMIT_MSG="${TYPE}(${SCOPE}): ${SUBJECT}"
    fi
else
    if [ "$BREAKING" = "y" ] || [ "$BREAKING" = "Y" ]; then
        COMMIT_MSG="${TYPE}!: ${SUBJECT}"
    else
        COMMIT_MSG="${TYPE}: ${SUBJECT}"
    fi
fi

# Add body if provided
if [ -n "$BODY" ]; then
    COMMIT_MSG="${COMMIT_MSG}

${BODY}"
fi

# Add breaking change footer if needed
if [ "$BREAKING" = "y" ] || [ "$BREAKING" = "Y" ]; then
    echo ""
    read -p "Describe the breaking change: " BREAKING_DESC
    COMMIT_MSG="${COMMIT_MSG}

BREAKING CHANGE: ${BREAKING_DESC}"
fi

# Show preview
echo ""
echo -e "${GREEN}Commit message preview:${NC}"
echo "=============================="
echo "$COMMIT_MSG"
echo "=============================="
echo ""

# Confirm
read -p "Commit with this message? (Y/n): " CONFIRM

if [ "$CONFIRM" = "n" ] || [ "$CONFIRM" = "N" ]; then
    echo "Commit cancelled"
    exit 0
fi

# Make the commit
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Commit successful!${NC}"
else
    echo -e "${YELLOW}❌ Commit failed${NC}"
    exit 1
fi
