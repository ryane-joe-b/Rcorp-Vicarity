# GitHub Actions SSH Authentication Fix

## Current Error
```
Permission denied (publickey,password)
Error: Process completed with exit code 255
```

## Most Likely Causes & Fixes

### Issue 1: SSH Key Format in GitHub Secrets (BASE64 SOLUTION)

GitHub Secrets mangles newlines in SSH keys. The solution is to base64 encode the key.

**Fix:**
1. SSH to your server manually
2. Get the BASE64-encoded private key:
   ```bash
   sudo cat /home/deploy/.ssh/id_ed25519 | base64 -w 0
   ```
3. Copy the ENTIRE base64 string (it will be one long line)
4. Go to GitHub repo → Settings → Secrets → Actions
5. Edit `VPS_SSH_KEY` secret
6. Paste the base64 string (no newlines, just the encoded string)
7. Save

The workflow will automatically decode it with `base64 -d` before using it.

### Issue 2: Wrong Public Key on Server

The public key on the server doesn't match the private key in GitHub Secrets.

**Fix on Server:**
```bash
# Run as root or with sudo
sudo su -

# Verify the SSH verification script
bash /home/deploy/vicarity/infra/verify-ssh-setup.sh

# Check current public key
cat /home/deploy/.ssh/authorized_keys

# If the key looks wrong, regenerate and update GitHub Secrets:
# (This will create a new key pair - you'll need to update GitHub)
sudo -u deploy ssh-keygen -t ed25519 -C "vicarity-deploy" -f /home/deploy/.ssh/id_ed25519 -N ""

# Show the NEW public key (already in authorized_keys)
cat /home/deploy/.ssh/id_ed25519.pub

# Show the NEW private key (update in GitHub Secrets as VPS_SSH_KEY)
cat /home/deploy/.ssh/id_ed25519
```

### Issue 3: File Permissions

**Fix on Server:**
```bash
sudo su -

# Fix all permissions
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/id_ed25519
chmod 644 /home/deploy/.ssh/id_ed25519.pub

# Verify
ls -la /home/deploy/.ssh/
```

Expected output:
```
drwx------ 2 deploy deploy 4096 ... .
drwxr-x--- 3 deploy deploy 4096 ... ..
-rw------- 1 deploy deploy  xxx ... authorized_keys
-rw------- 1 deploy deploy  xxx ... id_ed25519
-rw-r--r-- 1 deploy deploy  xxx ... id_ed25519.pub
```

### Issue 4: SELinux or SSH Configuration

**Fix on Server:**
```bash
# Check SSH config allows key auth
sudo grep -E "PubkeyAuthentication|PasswordAuthentication|PermitRootLogin" /etc/ssh/sshd_config

# Should see:
# PubkeyAuthentication yes
# PasswordAuthentication no (or yes, doesn't matter for key auth)

# If PubkeyAuthentication is 'no', change it:
sudo sed -i 's/^PubkeyAuthentication no/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# Restart SSH
sudo systemctl restart sshd

# Check SELinux (if enabled)
sudo restorecon -R -v /home/deploy/.ssh
```

### Issue 5: Test Connection Locally First

Before relying on GitHub Actions, test SSH locally:

```bash
# On your local machine
# Copy the private key to a file
cat > /tmp/test_key << 'EOF'
-----BEGIN OPENSSH PRIVATE KEY-----
[paste the key from /home/deploy/.ssh/id_ed25519]
-----END OPENSSH PRIVATE KEY-----
EOF

chmod 600 /tmp/test_key

# Test connection (replace YOUR_SERVER_IP)
ssh -i /tmp/test_key deploy@YOUR_SERVER_IP "echo 'Success!'"

# If this works, the problem is with GitHub Secrets
# If this fails, the problem is with the server setup
```

## Quick Diagnosis Script

Run this on your VPS:

```bash
# Download and run the verification script
cd /home/deploy/vicarity
git pull
sudo bash infra/verify-ssh-setup.sh
```

## Step-by-Step Resolution

1. **SSH to your server**
2. **Run verification script:**
   ```bash
   sudo bash /home/deploy/vicarity/infra/verify-ssh-setup.sh
   ```
3. **Fix any issues reported**
4. **Get the current private key:**
   ```bash
   sudo cat /home/deploy/.ssh/id_ed25519
   ```
5. **Update GitHub Secret:**
   - Go to: https://github.com/ryane-joe-b/Rcorp-Vicarity/settings/secrets/actions
   - Edit `VPS_SSH_KEY`
   - Paste the EXACT key (all lines, including BEGIN/END)
6. **Test locally first:**
   ```bash
   ssh -i /path/to/key deploy@YOUR_IP "echo test"
   ```
7. **Push a small change to trigger workflow**

## Alternative: Use Password Authentication (Temporary)

If you need to deploy urgently while debugging SSH keys:

**On Server:**
```bash
# Enable password auth temporarily
sudo sed -i 's/^PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

**In GitHub Actions:**
Update workflow to use `sshpass`:
```yaml
- name: Install sshpass
  run: sudo apt-get update && sudo apt-get install -y sshpass

- name: Deploy with password
  env:
    SSHPASS: ${{ secrets.VPS_PASSWORD }}
  run: |
    sshpass -e ssh -o StrictHostKeyChecking=no ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} << 'ENDSSH'
    # deployment commands
    ENDSSH
```

Add `VPS_PASSWORD` secret with the deploy user password.

**WARNING:** This is less secure. Switch back to key-based auth after fixing.

## Still Not Working?

Check server logs:
```bash
# On VPS
sudo tail -f /var/log/auth.log
# Or on some systems:
sudo journalctl -u ssh -f
```

Then trigger the GitHub Action and watch for errors in real-time.
