#!/usr/bin/env bash
set -euo pipefail

# Expect either BASIC_AUTH_HTPASSWD or BASIC_AUTH_USER/BASIC_AUTH_PASSWORD
: "${BASIC_AUTH_HTPASSWD:=}"
: "${BASIC_AUTH_USER:=}"
: "${BASIC_AUTH_PASSWORD:=}"

HTPASSWD_FILE="/etc/nginx/.htpasswd"

if [[ -n "$BASIC_AUTH_HTPASSWD" ]]; then
  printf "%s\n" "$BASIC_AUTH_HTPASSWD" > "$HTPASSWD_FILE"
elif [[ -n "$BASIC_AUTH_USER" && -n "$BASIC_AUTH_PASSWORD" ]]; then
  HASH=$(openssl passwd -apr1 "$BASIC_AUTH_PASSWORD")
  printf "%s:%s\n" "$BASIC_AUTH_USER" "$HASH" > "$HTPASSWD_FILE"
else
  echo "ERROR: BASIC_AUTH credentials not provided. Set BASIC_AUTH_HTPASSWD or BASIC_AUTH_USER/BASIC_AUTH_PASSWORD." >&2
  exit 1
fi

exec nginx -g "daemon off;"

