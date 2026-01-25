# Get SSH Private Key for GitHub Secrets

Run this command on your VPS to get the EXACT private key:

```bash
sudo cat /home/deploy/.ssh/id_ed25519
```

Copy the ENTIRE output (all lines including BEGIN/END).

Then:
1. Go to: https://github.com/ryane-joe-b/Rcorp-Vicarity/settings/secrets/actions
2. Click on `VPS_SSH_KEY`
3. Click "Update secret"
4. Paste the ENTIRE key exactly as shown
5. Click "Update secret"

The key should look like this:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
[many lines of base64 text]
-----END OPENSSH PRIVATE KEY-----
```

**IMPORTANT:** 
- Include the BEGIN and END lines
- Include ALL lines in between
- Don't add or remove any blank lines
- Don't add any extra spaces
