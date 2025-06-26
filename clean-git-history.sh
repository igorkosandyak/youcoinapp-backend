#!/bin/bash

# Script to clean AWS credentials from git history
# This will rewrite git history to remove the sensitive data

echo "⚠️  WARNING: This script will rewrite git history!"
echo "This will change commit hashes and may affect collaboration."
echo "Make sure you have a backup and coordinate with your team."
echo ""

read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 1
fi

echo "🧹 Cleaning git history of AWS credentials..."

# Remove the files from git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch ENVIRONMENT_VARIABLES.md README.md src/config/validation.schema.ts' \
  --prune-empty --tag-name-filter cat -- --all

# Clean up the backup refs
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d

# Force garbage collection
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Git history cleaned!"
echo ""
echo "📝 Next steps:"
echo "1. Force push to remote: git push origin --force --all"
echo "2. Update your .env file with real credentials (but don't commit them)"
echo "3. Consider using git-secrets or pre-commit hooks to prevent future credential commits"
echo ""
echo "🔐 Security reminder:"
echo "- Rotate the exposed AWS credentials immediately"
echo "- Check AWS CloudTrail for any unauthorized usage"
echo "- Consider using IAM roles instead of access keys in production" 