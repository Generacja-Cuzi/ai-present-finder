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
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" \
    --set=dbuser="$dbuser" \
    --set=dbpass="$dbpass" \
    --set=dbname="$database" <<-'EOSQL'
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = :'dbuser') THEN
        EXECUTE format('CREATE USER %I WITH PASSWORD %L', :'dbuser', :'dbpass');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'dbname') THEN
        EXECUTE format('CREATE DATABASE %I', :'dbname');
      END IF;
      EXECUTE format('GRANT ALL PRIVILEGES ON DATABASE %I TO %I', :'dbname', :'dbuser');
    END
    $$ LANGUAGE plpgsql;
EOSQL

  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" \
    --set=dbuser="$dbuser" \
    --dbname="$database" <<-'EOSQL'
    DO $$
    BEGIN
      EXECUTE format('GRANT ALL ON SCHEMA public TO %I', :'dbuser');
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO %I', :'dbuser');
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO %I', :'dbuser');
    END
    $$ LANGUAGE plpgsql;
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
