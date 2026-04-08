---
description: Security rules and guidelines for the Unwind Journal project
---

# Security Rules for Unwind Journal

## ⚠️ CRITICAL: Never Store Secrets in Code

### API Keys & Credentials
- **NEVER** hardcode API keys, passwords, or credentials in any source files
- **NEVER** commit `.env.local`, `.env`, or any environment files containing real secrets
- **ALWAYS** use environment variables for all sensitive configuration

### Supabase Configuration
- Supabase URL and Anon Key must be set via environment variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```
- Placeholder values in `.env.example` are fine for documentation
- Real values must only exist in `.env.local` (gitignored)

### Before Committing Code
1. Check that no API keys are visible in the code
2. Ensure `.env.local` is in `.gitignore`
3. Run `git status` to verify no sensitive files are staged
4. Review diffs for accidental secret inclusion

### If Secrets Are Accidentally Committed
1. Immediately rotate/revoke the exposed credentials
2. Remove from git history using `git filter-branch` or BFG Repo-Cleaner
3. Force push the cleaned history (coordinate with team)
4. Notify affected parties

### Allowed Patterns
```typescript
// ✅ CORRECT: Use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ❌ WRONG: Never hardcode secrets
const supabaseKey = "eyJhbGciOiJIUzI1NiIs..." // NEVER DO THIS
```

### Review Checklist
- [ ] No API keys in source code
- [ ] No passwords in comments or strings
- [ ] Environment files are gitignored
- [ ] Only placeholder examples in committed `.env.example`

## Remember: Git history preserves everything forever. Be careful!
