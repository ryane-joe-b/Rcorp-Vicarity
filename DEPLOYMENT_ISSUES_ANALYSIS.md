# Deployment Issues - Root Cause Analysis

## Pattern of Failures

### Issue #1: Web Static Volume Caching
**When:** After pushing landing page code
**Symptom:** New landing page code deployed but old "API Connected" page still showing
**Root Cause:** Docker named volume `web-static` persists between builds
**Why it happened:** Volume wasn't cleared in deployment workflow
**Fix Applied:** Added volume removal step in workflow

### Issue #2: Invalid Docker Command
**When:** After adding volume cleanup
**Symptom:** Entire site went down
**Root Cause:** Used `docker compose down web nginx` - invalid syntax
**Why it happened:** `down` command doesn't accept service names as arguments
**Fix Applied:** Changed to `docker compose stop web nginx`

### Issue #3: Python Type Annotation Compatibility
**When:** After enhancing health endpoint
**Symptom:** Entire site went down, API crashed
**Root Cause:** Used `list[Type]` syntax which requires Python 3.10+
**Why it happened:** Production uses Python 3.11 in Dockerfile but Pydantic/FastAPI may not support new syntax
**Fix Applied:** Changed to `List[Type]` from typing module

## Common Thread: LACK OF LOCAL TESTING

### The Real Problem
**We're testing IN PRODUCTION.** Every commit triggers auto-deployment which:
1. Takes 5-7 minutes
2. Can break the live site
3. Affects real users
4. No validation before deployment

## Permanent Solutions

### Solution 1: Local Docker Testing Environment
Create a `docker-compose.dev.yml` that mimics production:

```yaml
# Same structure as production but with:
# - Local environment variables
# - No SSL requirements  
# - Faster rebuild times
# - Volume mounts for hot reload
```

**Test locally BEFORE pushing:**
```bash
# Build and test locally
docker compose -f docker-compose.dev.yml up --build

# Test health endpoint
curl http://localhost/health

# Test all endpoints
curl http://localhost/api/public/stats

# Only push if everything works
git push origin main
```

### Solution 2: Staging Environment
- Create a separate `staging` branch
- Deploy staging to subdomain: staging.vicarity.co.uk
- Test there first before merging to main
- Only main branch deploys to production

### Solution 3: Better Deployment Workflow
Add validation steps BEFORE deployment:

```yaml
jobs:
  validate:
    - Python syntax check
    - Type annotation validation
    - Docker build test (don't deploy)
    - API health check simulation
    
  deploy:
    needs: validate
    only-if: validate passes
```

### Solution 4: Rollback Automation
Current rollback is manual. Should be automatic:

```yaml
verify:
  steps:
    - Wait 2 minutes after deployment
    - Test all critical endpoints
    - If any fail -> automatic rollback
    - Alert team
```

### Solution 5: Better Health Checks
The API health check in the workflow uses `/health` endpoint.
If that endpoint has a bug (like we just had), deployment fails but site goes down.

**Fix:** Use a SIMPLE health check that never changes:
```python
@app.get("/_health_simple")
async def simple_health():
    return {"ok": True}
```

Use this for deployment validation, keep `/health` for detailed monitoring.

## Immediate Actions Needed

1. **Create local docker-compose.dev.yml** - Test changes locally
2. **Add syntax validation to workflow** - Catch Python errors before deploy
3. **Add simple health endpoint** - Don't let health check itself break deployment
4. **Document testing procedure** - Always test locally first
5. **Consider staging environment** - Test before production

## Lessons Learned

1. **Never push to main without local testing**
2. **Auto-deployment is convenient but dangerous**
3. **Every deployment is a risk** - minimize changes per deploy
4. **Health checks should be simple and stable**
5. **Type annotations matter** - Python 3.10+ syntax breaks in older versions
6. **Docker volumes persist** - understand your compose file
7. **Always have a rollback plan** - manual recovery took too long

## Next Steps

After the current hotfix deploys and site is stable:
1. Create local development environment
2. Add pre-commit hooks for syntax checking
3. Test everything locally before pushing
4. Consider adding a staging environment
5. Improve deployment workflow with better validation
