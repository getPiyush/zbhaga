# Quick Start: Finding & Fixing Application Issues

**Time Required:** 5-30 minutes depending on issues found  
**Difficulty:** Intermediate

---

## ⚡ 30-Second Summary

1. **Run comprehensive test script:**
   ```bash
   bash scripts/run-and-analyze-tests.sh
   ```

2. **Review results:**
   ```bash
   cat test-logs/issues-*.md
   open cucumber-report.html
   ```

3. **Fix issues:**
   - Identify problem from error message
   - Find root cause in code
   - Make fix
   - Re-run test to verify

---

## 🚀 5-Minute Quick Start

### Step 1: Start Testing (2 min)
```bash
cd /Users/piyush/Development/zrugal/zbhaga
bash scripts/run-and-analyze-tests.sh
```

This will:
- ✓ Clean test data
- ✓ Start API server
- ✓ Start Web app
- ✓ Run all tests
- ✓ Generate reports
- ✓ Stop services
- ✓ Create issue report

### Step 2: Check Results (2 min)
```bash
# View issue summary
cat test-logs/issues-*.md

# Or view full report
open cucumber-report.html

# Or check specific error
grep -i "error" test-logs/test-run-*.log | head -5
```

### Step 3: Fix Issues (1+ min each)
```bash
# For each issue:
1. Understand what failed
2. Find the root cause
3. Edit the code
4. Re-run test to verify
```

---

## 🎯 Common Issues & Quick Fixes

### Issue: User Can't Login

**Error Message:** "Cannot find user" or "Wrong password"

**Quick Check:**
```bash
# 1. Is API running?
curl http://localhost:4000/health

# 2. Check signup worked
curl http://localhost:4000/users | grep email

# 3. Check password stored
# (Can't check directly, but if signup worked, should be fine)
```

**Fix:**
- Verify signup endpoint creates user
- Check password hashing
- Test with hardcoded user

### Issue: Group Not Created

**Error Message:** "Group not found" or "Failed to create group"

**Quick Check:**
```bash
# 1. Check if API endpoint exists
curl -X POST http://localhost:4000/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'

# 2. Check database
SELECT * FROM groups;
```

**Fix:**
- Verify POST /groups endpoint
- Check database insert
- Verify response returns group ID

### Issue: Expense Amount Wrong

**Error Message:** "Expected $100.50 but got $100.00"

**Quick Check:**
```bash
# Check database
SELECT * FROM expenses WHERE id = 1;

# Check API response
curl http://localhost:4000/expenses/1
```

**Fix:**
- Change Math.floor() to proper decimal handling
- Use toFixed(2) for display
- Verify database stores decimals

### Issue: Can't See Another User's Data

**Error Message:** "404 Not Found" or "Unauthorized"

**Quick Check:**
```bash
# Check authorization
# Add auth token to request
curl http://localhost:4000/expenses \
  -H "Authorization: Bearer TOKEN"
```

**Fix:**
- Add user ID check to queries
- Verify ownership before returning
- Test with different users

---

## 🔍 Debugging Workflow

### When Test Fails:

```
1. READ ERROR MESSAGE
   ↓
2. IDENTIFY WHAT FAILED
   - API issue?
   - UI issue?
   - Data issue?
   ↓
3. FIND THE CODE
   - Which file?
   - Which function?
   ↓
4. UNDERSTAND THE BUG
   - What's wrong?
   - Why is it wrong?
   ↓
5. FIX IT
   - Make minimal change
   - Test the fix
   ↓
6. VERIFY
   - Re-run the test
   - Check related tests
```

---

## 📋 Issue Documentation Template

For each issue you find, create entry in [APPLICATION_ISSUES_ANALYSIS.md](APPLICATION_ISSUES_ANALYSIS.md):

```markdown
### Issue #N: [Title]

**Severity:** [🔴/🟠/🟡/🟢]  
**Status:** New

**What Failed:**
[Copy error message here]

**Expected:**
[What should happen]

**Actual:**
[What actually happens]

**Root Cause:**
[Why is it happening]

**Fix:**
[How to fix it]

**File:**
[Which file to edit]

**Verified:**
[ ] Fixed and test passes
```

---

## 🛠️ Tools Cheat Sheet

### Test Execution
```bash
# Run all tests
npm run test:cucumber:feature

# Run with logging
bash scripts/run-and-analyze-tests.sh

# Quick test
npm run dev:api & npm run dev:web & npm run test:cucumber:feature
```

### Debugging
```bash
# Check API
curl http://localhost:4000/health

# Check Web
curl http://localhost:8081

# View logs
cat test-logs/api-*.log | grep error
cat test-logs/web-*.log | grep error

# Inspect database
psql -d database_name
SELECT * FROM expenses;
```

### Code Changes
```bash
# Make edit
nano apps/api/src/routes/expenses.ts

# Type check
npm run typecheck

# Test
npm run test:cucumber:feature

# Commit
git add .
git commit -m "fix: issue #N - description"
```

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Run tests | 2-5 min |
| Review results | 2-5 min |
| Identify issue | 1-5 min |
| Find root cause | 2-10 min |
| Implement fix | 2-10 min |
| Verify fix | 1-5 min |
| **Total per issue** | **10-40 min** |

---

## ✅ Checklist for Each Fix

- [ ] Error understood
- [ ] Root cause identified
- [ ] Code change made
- [ ] Type check passes
- [ ] Test re-run passes
- [ ] Related tests pass
- [ ] Logs are clean
- [ ] Issue documented
- [ ] Commit message clear

---

## 🚨 If Stuck

### Test Won't Run:
1. Check if services started: `curl http://localhost:4000/health`
2. Check logs: `cat test-logs/api-*.log`
3. Restart: `bash scripts/run-and-analyze-tests.sh`

### Can't Find the Issue:
1. Check error message carefully
2. Add logging to code
3. Run test again
4. Check logs for more detail

### Fix Doesn't Work:
1. Re-run test to confirm
2. Check if change was saved
3. Check if code is being used
4. Add console.log() to verify execution

### Still Stuck:
1. Check [FINDING_AND_FIXING_APP_ISSUES.md](FINDING_AND_FIXING_APP_ISSUES.md) for detailed guide
2. Review error logs in detail
3. Add more logging/debugging
4. Test endpoint manually with curl

---

## 📞 Key Resources

- **Full Guide:** [FINDING_AND_FIXING_APP_ISSUES.md](FINDING_AND_FIXING_APP_ISSUES.md)
- **Issue Tracking:** [APPLICATION_ISSUES_ANALYSIS.md](APPLICATION_ISSUES_ANALYSIS.md)
- **Test Reports:** `cucumber-report.html`
- **Test Logs:** `test-logs/`
- **API Code:** `apps/api/`
- **Web Code:** `apps/client/`

---

## 🎯 One Command to Rule Them All

```bash
bash scripts/run-and-analyze-tests.sh && open test-logs/issues-*.md
```

This will:
1. Run entire test suite
2. Generate issue report
3. Open issue report automatically

---

**Ready to find and fix issues? Start with:**
```bash
bash scripts/run-and-analyze-tests.sh
```

