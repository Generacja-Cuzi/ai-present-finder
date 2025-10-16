#!/bin/sh
set -e

# Get the API URL from environment variable, fallback to localhost if not set
API_URL="${VITE_BACKEND_URL:-${SERVICE_URL_APP:-http://localhost:3000}}"

echo "Injecting runtime configuration..."
echo "API_URL: $API_URL"

# Create runtime config file
cat > /usr/share/nginx/html/config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  apiUrl: "$(printf '%s' "${API_URL}" | sed 's/"/\\"/g')"
};
EOF

echo "Runtime configuration injected successfully"

# Execute the original nginx entrypoint
exec /docker-entrypoint.sh "$@"
