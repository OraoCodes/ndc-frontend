# NDC Deployment Helpers

This folder contains helper files to deploy the NDC project to a VPS.

Files

- `ndc.service` - example `systemd` unit to run the Node API as `www-data`.
- `deploy.sh` - an opinionated deploy script that builds the project and installs
  the SPA into `/var/www/ndc/dist/spa`, installs an Apache site and the systemd
  unit, then restarts services. Run this on the VPS from the repository root.
- `apache-ndc.conf` - Apache vhost template (in repo root `deploy/`). Edit and
  review before copying to `/etc/apache2/sites-available/ndc.conf`.

## Usage (on VPS)

1. SSH into the VPS (example):

   ```bash
   ssh iris@86.48.0.228
   cd /path/to/repo
   ```

2. Make the deploy script executable and run it (from repo root):

   ```bash
   chmod +x deploy/deploy.sh
   ./deploy/deploy.sh
   ```

3. Check service and logs:

   ```bash
   sudo systemctl status ndc.service
   sudo journalctl -u ndc.service -f
   sudo tail -n 200 /var/log/apache2/ndc_error.log
   ```

## Notes

- The deploy script is intentionally conservative: it copies the Apache site
  only if `/etc/apache2/sites-available/ndc.conf` is missing.
- The `ndc.service` uses `/usr/bin/node dist/server/node-build.mjs` as the
  ExecStart; adjust if Node is installed elsewhere or if you prefer `npm start`.
- For TLS use Certbot: `sudo certbot --apache -d ndc.iris-studios.co.ke`.
- For large file uploads consider moving file storage out of SQLite.
