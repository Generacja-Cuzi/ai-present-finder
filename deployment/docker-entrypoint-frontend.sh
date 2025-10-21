#!/bin/sh
set -e

# Get the API URL from environment variable
# Priority: SERVICE_URL_APP (Coolify) > VITE_BACKEND_URL > localhost
API_URL="${SERVICE_URL_APP:-${VITE_BACKEND_URL:-http://localhost:3000}}"

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
