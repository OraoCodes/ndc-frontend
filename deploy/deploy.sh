#!/usr/bin/env bash
set -euo pipefail

# deploy/deploy.sh
# Run this on the VPS from the repository root (where this script lives).
# It builds the project, installs production deps, copies the built SPA
# into `/var/www/ndc/dist/spa`, installs the Apache site if needed,
# installs the systemd unit and restarts services.

REPO_DIR="$(pwd)"
WWW_DIR="/var/www/ndc"
SPA_DST="$WWW_DIR/dist/spa"
APACHE_SITE_NAME="ndc.conf"

echo "Deploy started: $(date)"

if [ "$(id -u)" = "0" ]; then
  echo "Do NOT run this script as root. Run as your deploy user (ssh to VPS as 'iris')." >&2
  exit 1
fi

echo "Installing dependencies (production) and building..."
# Install everything needed to build; use npm ci if node_modules not present
npm install

echo "Building client/server artifacts..."
npm run build

echo "Ensuring $SPA_DST exists and copying built SPA files..."
sudo mkdir -p "$SPA_DST"
sudo rsync -a --delete "$REPO_DIR/dist/spa/" "$SPA_DST/"
sudo chown -R www-data:www-data "$WWW_DIR"

echo "Installing Apache site (if not present)..."
if [ ! -f "/etc/apache2/sites-available/$APACHE_SITE_NAME" ]; then
  echo "Copying deploy/apache-ndc.conf to /etc/apache2/sites-available/$APACHE_SITE_NAME"
  sudo cp "$REPO_DIR/deploy/apache-ndc.conf" "/etc/apache2/sites-available/$APACHE_SITE_NAME"
  # The apache config contains both reverse-proxy and DocumentRoot variants.
  echo "(If necessary edit /etc/apache2/sites-available/$APACHE_SITE_NAME to set ServerName and DocumentRoot.)"
  sudo a2enmod rewrite proxy proxy_http headers ssl || true
  sudo a2ensite "$APACHE_SITE_NAME" || true
  sudo systemctl reload apache2 || true
else
  echo "Apache site $APACHE_SITE_NAME already present; skipping copy."
fi

echo "Installing systemd unit..."
if [ ! -f "/etc/systemd/system/ndc.service" ]; then
  sudo cp "$REPO_DIR/deploy/ndc.service" /etc/systemd/system/ndc.service
  sudo systemctl daemon-reload
  sudo systemctl enable ndc.service
fi

echo "Restarting node service and apache..."
sudo systemctl restart ndc.service || true
sudo systemctl reload apache2 || true

echo "Deploy finished: $(date)"
echo "Check logs: sudo journalctl -u ndc.service -f and sudo tail -n 200 /var/log/apache2/ndc_error.log"
