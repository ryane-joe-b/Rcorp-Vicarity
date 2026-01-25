#!/bin/bash
#===============================================================================
# SSH SETUP VERIFICATION SCRIPT
# Run this on the VPS to verify SSH is configured correctly for GitHub Actions
#===============================================================================

set -e

echo "=== Vicarity SSH Setup Verification ==="
echo ""

# Check if deploy user exists
echo "1. Checking deploy user..."
if id "deploy" &>/dev/null; then
    echo "   ✓ Deploy user exists"
else
    echo "   ✗ Deploy user does not exist"
    exit 1
fi

# Check home directory
echo ""
echo "2. Checking home directory..."
if [ -d "/home/deploy" ]; then
    echo "   ✓ Home directory exists"
    ls -la /home/deploy/.ssh 2>/dev/null || echo "   ⚠ .ssh directory not found"
else
    echo "   ✗ Home directory not found"
    exit 1
fi

# Check SSH directory permissions
echo ""
echo "3. Checking SSH directory permissions..."
if [ -d "/home/deploy/.ssh" ]; then
    PERMS=$(stat -c %a /home/deploy/.ssh)
    if [ "$PERMS" == "700" ]; then
        echo "   ✓ SSH directory permissions correct (700)"
    else
        echo "   ⚠ SSH directory permissions: $PERMS (should be 700)"
        echo "   Fix with: chmod 700 /home/deploy/.ssh"
    fi
else
    echo "   ✗ SSH directory does not exist"
    exit 1
fi

# Check authorized_keys file
echo ""
echo "4. Checking authorized_keys..."
if [ -f "/home/deploy/.ssh/authorized_keys" ]; then
    PERMS=$(stat -c %a /home/deploy/.ssh/authorized_keys)
    if [ "$PERMS" == "600" ]; then
        echo "   ✓ authorized_keys permissions correct (600)"
    else
        echo "   ⚠ authorized_keys permissions: $PERMS (should be 600)"
        echo "   Fix with: chmod 600 /home/deploy/.ssh/authorized_keys"
    fi
    
    # Check ownership
    OWNER=$(stat -c %U /home/deploy/.ssh/authorized_keys)
    if [ "$OWNER" == "deploy" ]; then
        echo "   ✓ authorized_keys owned by deploy user"
    else
        echo "   ⚠ authorized_keys owned by: $OWNER (should be deploy)"
        echo "   Fix with: chown deploy:deploy /home/deploy/.ssh/authorized_keys"
    fi
    
    # Show key count
    KEY_COUNT=$(grep -c "^ssh-" /home/deploy/.ssh/authorized_keys 2>/dev/null || echo "0")
    echo "   ✓ Number of keys: $KEY_COUNT"
    
    if [ "$KEY_COUNT" -gt 0 ]; then
        echo ""
        echo "   Public key fingerprints:"
        ssh-keygen -l -f /home/deploy/.ssh/authorized_keys
    fi
else
    echo "   ✗ authorized_keys file does not exist"
    exit 1
fi

# Check SSH daemon config
echo ""
echo "5. Checking SSH daemon configuration..."
if grep -q "^PubkeyAuthentication yes" /etc/ssh/sshd_config; then
    echo "   ✓ PubkeyAuthentication enabled"
elif grep -q "^#PubkeyAuthentication" /etc/ssh/sshd_config; then
    echo "   ⚠ PubkeyAuthentication commented (default: yes)"
else
    echo "   ⚠ PubkeyAuthentication not explicitly set (default: yes)"
fi

# Check if PasswordAuthentication is disabled
if grep -q "^PasswordAuthentication no" /etc/ssh/sshd_config; then
    echo "   ✓ PasswordAuthentication disabled (more secure)"
elif grep -q "^PasswordAuthentication yes" /etc/ssh/sshd_config; then
    echo "   ⚠ PasswordAuthentication enabled"
fi

# Check authorized keys file location
if grep -q "^AuthorizedKeysFile" /etc/ssh/sshd_config; then
    AUTH_KEYS=$(grep "^AuthorizedKeysFile" /etc/ssh/sshd_config)
    echo "   ℹ $AUTH_KEYS"
fi

# Test sudo access
echo ""
echo "6. Checking deploy user sudo access..."
if sudo -l -U deploy | grep -q "NOPASSWD"; then
    echo "   ✓ Deploy user has passwordless sudo"
else
    echo "   ⚠ Deploy user may not have passwordless sudo"
fi

# Check if vicarity directory exists
echo ""
echo "7. Checking project directory..."
if [ -d "/home/deploy/vicarity" ]; then
    echo "   ✓ Project directory exists"
    OWNER=$(stat -c %U /home/deploy/vicarity)
    if [ "$OWNER" == "deploy" ]; then
        echo "   ✓ Project directory owned by deploy user"
    else
        echo "   ⚠ Project directory owned by: $OWNER"
    fi
else
    echo "   ℹ Project directory not yet created (normal for first deployment)"
fi

echo ""
echo "=== Verification Complete ==="
echo ""
echo "If all checks passed, SSH should work for GitHub Actions."
echo ""
echo "To test manually from your local machine:"
echo "  ssh -i ~/.ssh/your_private_key deploy@$(hostname -I | awk '{print $1}')"
echo ""
echo "To view the public key that should be in GitHub Secrets:"
echo "  cat /home/deploy/.ssh/id_ed25519.pub"
echo "  (Or the corresponding .pub file for your key)"
