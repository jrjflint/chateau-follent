# Cloudflared Credential Handling

The Cloudflared tunnel serving Lord James Follent's preview environment requires
secrets that must never live in Git. Follow this checklist each time you
provision or rotate tunnel access:

1. Generate a fresh tunnel credential JSON from the Cloudflare dashboard or via
   `cloudflared tunnel create`. Store the downloaded file in the shared secrets
   vault and mark any previously published UUIDs as revoked.
2. Update the vault entry with the new tunnel UUID, token, and credential
   filename. Document the regeneration date so contributors know which values
   are current.
3. Copy `cloudflared/.env.example` to `cloudflared/.env`, populate the variables
   with the secret values, and keep the populated file out of version control.
4. Mount the credential JSON from a secure location on disk when running
   `docker compose up`. Avoid placing the live credential inside the repository;
   use a temporary path such as `~/secrets/cloudflared/<uuid>.json` and point the
   `CLOUDFLARED_CREDENTIALS_FILE_HOST` variable at it.
5. When rotating credentials, delete any obsolete JSON files, tokens, and
   UUIDs. Update this README with a short note summarising the rotation for
   transparency if process changes occur.

These steps ensure tunnel material is treated as ephemeral and aligns with the
security hardening commitments made to Lord James Follent.
