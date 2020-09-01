#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username postgres --dbname postgres <<-EOSQL
    CREATE USER stocktaking;
    ALTER USER stocktaking WITH PASSWORD '$POSTGRES_CUSTOM_USER_PASSWORD';
    ALTER USER postgres WITH PASSWORD '$POSTGRES_PASSWORD';
    CREATE DATABASE stocktaking;
    GRANT ALL PRIVILEGES ON DATABASE stocktaking TO stocktaking;
    CREATE EXTENSION pg_stat_statements;
EOSQL