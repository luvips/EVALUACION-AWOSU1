#!/bin/sh
set -eu

escape() {
  printf '%s' "$1" | sed -e 's/[&|]/\\&/g'
}

app_user=$(escape "$DB_APP_USER")
app_password=$(escape "$DB_APP_PASSWORD")
db_name=$(escape "$POSTGRES_DB")

sed \
  -e "s|__DB_APP_USER__|$app_user|g" \
  -e "s|__DB_APP_PASSWORD__|$app_password|g" \
  -e "s|__POSTGRES_DB__|$db_name|g" \
  /db/roles.sql \
  | psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
