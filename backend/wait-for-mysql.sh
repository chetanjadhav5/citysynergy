#!/bin/sh
# wait-for-mysql.sh

set -e

echo "DB_HOST=$DB_HOST"
echo "DB_PORT=$DB_PORT"

host="$DB_HOST"
port="$DB_PORT"

echo "⏳ Waiting for MySQL at $host:$port..."

until nc -z "$host" "$port"; do
  echo "⏳ MySQL is unavailable, sleeping 5s..."
  sleep 5
done

echo "✅ MySQL is up! Starting backend..."
exec "$@"

