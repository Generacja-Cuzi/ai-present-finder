#!/bin/bash
set -e
set -u

function create_user_and_database() {
  local database=$1
  # Extract service name from database name (e.g., "reranking_service" -> "reranking")
  local service_name="${database%_service}"
  local dbuser="${service_name}_user"
  local dbpass="${service_name}_password"

  echo "Creating user '$dbuser' and database '$database'"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<EOSQL
    DO \$\$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$dbuser') THEN
        CREATE USER $dbuser WITH PASSWORD '$dbpass';
      END IF;
    END
    \$\$ LANGUAGE plpgsql;
    
    SELECT 'CREATE DATABASE $database'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$database')\gexec
    
    GRANT ALL PRIVILEGES ON DATABASE $database TO $dbuser;
EOSQL

  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="$database" <<EOSQL
    GRANT ALL ON SCHEMA public TO $dbuser;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $dbuser;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $dbuser;
EOSQL
}

if [ -n "${POSTGRES_MULTIPLE_DATABASES:-}" ]; then
  echo "Multiple database creation requested: ${POSTGRES_MULTIPLE_DATABASES}"
  IFS=',' read -r -a DBS <<< "${POSTGRES_MULTIPLE_DATABASES}"
  for db in "${DBS[@]}"; do
    create_user_and_database "${db}"
  done
  echo "Multiple databases and users created"
fi
