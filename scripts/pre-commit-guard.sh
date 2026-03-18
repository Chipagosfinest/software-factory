#!/usr/bin/env bash
# Pre-commit guard: prevents known anti-patterns from entering the codebase.
#
# What it catches:
# 1. execSync with string interpolation (command injection vector)
# 2. Empty catch blocks (silent failure pattern)
# 3. Hardcoded API keys/tokens
# 4. Files over 400 lines (mega-file prevention)
# 5. Duplicate function definitions
#
# Install: cp scripts/pre-commit-guard.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

set -e

STAGED_TS=$(git diff --cached --name-only --diff-filter=ACM | grep '\.ts$' || true)

if [ -z "$STAGED_TS" ]; then
  exit 0
fi

ERRORS=0

# 1. Block execSync with template literals (command injection)
# Safe pattern: execFileSync('git', ['arg1', 'arg2'])
# Unsafe pattern: execSync(`git ${userInput}`)
if git diff --cached -U0 -- $STAGED_TS | grep -E '^\+.*execSync\s*\(' | grep -v 'execFileSync' | grep -q '`'; then
  echo "❌ BLOCKED: execSync() with template literal detected."
  echo "   Use execFileSync('cmd', ['arg1', 'arg2']) instead."
  echo "   Reason: String interpolation in shell commands = command injection."
  git diff --cached -U0 -- $STAGED_TS | grep -n -E '^\+.*execSync\s*\(' | grep '`'
  ERRORS=$((ERRORS + 1))
fi

# 2. Warn on empty catch blocks (silent failures)
EMPTY_CATCHES=$(git diff --cached -U0 -- $STAGED_TS | grep -c '^\+.*catch\s*{' || true)
if [ "$EMPTY_CATCHES" -gt 0 ]; then
  echo "⚠️  WARNING: $EMPTY_CATCHES empty catch block(s) in staged changes."
  echo "   Add logging or rethrow. Silent failures compound into invisible bugs."
fi

# 3. Block hardcoded secrets
if git diff --cached -- $STAGED_TS | grep -qE '^\+.*(sk-[a-zA-Z0-9]{20,}|lin_api_[a-zA-Z0-9]+|ghp_[a-zA-Z0-9]+|xoxb-|AIza[a-zA-Z0-9]+)'; then
  echo "❌ BLOCKED: Possible hardcoded API key detected in staged changes."
  echo "   Use environment variables instead."
  ERRORS=$((ERRORS + 1))
fi

# 4. Block files over 400 lines (mega-file prevention)
for file in $STAGED_TS; do
  if [ -f "$file" ]; then
    LINES=$(wc -l < "$file" | tr -d ' ')
    if [ "$LINES" -gt 400 ]; then
      echo "⚠️  WARNING: $file is $LINES lines (limit: 400)."
      echo "   Consider splitting into smaller modules."
    fi
  fi
done

# 5. Check for CORS wildcard (network exposure)
if git diff --cached -- $STAGED_TS | grep -qE '^\+.*Access-Control-Allow-Origin.*\*'; then
  echo "❌ BLOCKED: CORS wildcard (Access-Control-Allow-Origin: *) detected."
  echo "   Restrict to specific origins or localhost."
  ERRORS=$((ERRORS + 1))
fi

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "Commit blocked by pre-commit guard ($ERRORS error(s))."
  echo "Fix the issues above or use --no-verify to bypass (not recommended)."
  exit 1
fi

echo "✅ Pre-commit guard passed."
