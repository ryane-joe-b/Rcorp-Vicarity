# Troubleshooting GitHub Actions SSH Authentication

## Problem
GitHub Actions is failing with: `ssh: unable to authenticate, attempted methods [none publickey]`

## Root Cause
The `VPS_SSH_KEY` GitHub secret doesn't match the private key on your server.

---

## Solution 1: Verify and Re-add SSH Key (Recommended)

### Step 1: Get the private key from your server

```bash
ssh deploy@YOUR_SERVER_IP
cat ~/.ssh/id_ed25519
```

### Step 2: Copy the ENTIRE output

**IMPORTANT**: Copy from `-----BEGIN OPENSSH PRIVATE KEY-----` to `-----END OPENSSH PRIVATE KEY-----` including those lines.

Example of what you should copy:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDxKt6T8Qs5i0Zy0x... (many more lines)
...more base64 encoded text...
-----END OPENSSH PRIVATE KEY-----
```

### Step 3: Delete and re-create the GitHub secret

1. Go to: https://github.com/ryane-joe-b/Rcorp-Vicarity/settings/secrets/actions
2. Find `VPS_SSH_KEY` and click "Remove"
3. Click "New repository secret"
4. Name: `VPS_SSH_KEY`
5. Value: Paste the ENTIRE key (use Ctrl+A, Ctrl+C to ensure everything is selected)
6. Click "Add secret"

### Step 4: Test with a new deployment

Push any change to trigger deployment:
```bash
git commit --allow-empty -m "Test deployment"
git push
```

---

## Solution 2: Use Manual Deployment (Temporary)

If GitHub Actions still doesn't work, deploy manually:

```bash
cd /home/ryane/Desktop/vicarity
./infra/manual-deploy.sh YOUR_SERVER_IP
```

This bypasses GitHub Actions and deploys directly from your machine.

---

## Common Issues

### Issue 1: Wrong key copied

**Symptom**: Authentication still fails  
**Cause**: You copied the PUBLIC key instead of PRIVATE key  
**Fix**: 
- Private key is in: `~/.ssh/id_ed25519` (NO .pub extension)
- Public key is in: `~/.ssh/id_ed25519.pub` (WITH .pub extension)
- You need the PRIVATE key (without .pub)

### Issue 2: Extra whitespace

**Symptom**: Authentication fails  
**Cause**: Extra spaces or newlines when pasting  
**Fix**: 
1. Copy the key to a text editor first
2. Ensure no extra blank lines at top or bottom
3. Ensure each line (except BEGIN/END) is pure base64
4. Copy from text editor to GitHub

### Issue 3: Key doesn't exist on server

**Symptom**: `cat ~/.ssh/id_ed25519` says "No such file"  
**Cause**: Setup script wasn't run or didn't complete  
**Fix**: 
```bash
ssh deploy@YOUR_SERVER_IP
ls -la ~/.ssh/
```

If `id_ed25519` is missing, generate it:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
```

### Issue 4: Wrong permissions

**Symptom**: Key exists but SSH still fails  
**Cause**: Wrong file permissions  
**Fix**:
```bash
ssh deploy@YOUR_SERVER_IP
chmod 600 ~/.ssh/id_ed25519
chmod 700 ~/.ssh
```

---

## Verification Steps

### 1. Check key format locally
```bash
ssh deploy@YOUR_SERVER_IP "cat ~/.ssh/id_ed25519" | head -1
```
Should output: `-----BEGIN OPENSSH PRIVATE KEY-----`

### 2. Check key fingerprint
```bash
ssh deploy@YOUR_SERVER_IP "ssh-keygen -lf ~/.ssh/id_ed25519"
```
Should show: `256 SHA256:... (ED25519)`

### 3. Test SSH manually
```bash
ssh -i /path/to/saved/key deploy@YOUR_SERVER_IP "echo SUCCESS"
```
Should output: `SUCCESS`

---

## Alternative: Password Authentication (Not Recommended)

If SSH keys are too problematic, you can temporarily use password auth:

### Update GitHub Actions workflow

Change the deploy step to use password:
```yaml
- name: Deploy to server
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USER }}
    password: ${{ secrets.VPS_PASSWORD }}  # Add this secret
    script: |
      # deployment script
```

**WARNING**: This is less secure. SSH keys are strongly preferred.

---

## Still Not Working?

### Debug output

Add this to your GitHub Actions workflow to see what's happening:

```yaml
- name: Debug SSH
  run: |
    echo "VPS_HOST: ${{ secrets.VPS_HOST }}"
    echo "VPS_USER: ${{ secrets.VPS_USER }}"
    echo "Key length: ${#VPS_SSH_KEY}"
    echo "Key first line:"
    echo "${{ secrets.VPS_SSH_KEY }}" | head -1
```

### Contact support

If all else fails:
1. Use manual deployment: `./infra/manual-deploy.sh YOUR_SERVER_IP`
2. Check GitHub Actions logs for exact error
3. Verify server allows SSH with keys: `ssh deploy@SERVER "echo test"`

---

## Quick Command Reference

```bash
# Get private key from server
ssh deploy@SERVER_IP "cat ~/.ssh/id_ed25519"

# Test manual deployment  
./infra/manual-deploy.sh YOUR_SERVER_IP

# Check SSH connectivity
ssh deploy@YOUR_SERVER_IP "echo Connection OK"

# View GitHub Actions logs
# Go to: https://github.com/ryane-joe-b/Rcorp-Vicarity/actions
```

---

**Last Updated**: 2026-01-25  
**Status**: SSH key authentication troubleshooting
