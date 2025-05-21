#!/bin/sh
# filepath: ./bin/databaseUpdate.sh
# Usage: ./databaseUpdate.sh <entity> <id> <json_data>
# Exemple: ./databaseUpdate.sh user 3 '{"role":"admin"}'

if [ $# -lt 3 ]; then
  echo "Usage: $0 <entity> <id> <json_data> | jq"
  echo "Example: $0 user 3 '{\"role\":\"admin\"}' | jq"
  exit 1
fi

ENTITY="$1"
ID="$2"
JSON_DATA="$3"

BASE_URL="http://localhost:3000/api/v2/database/myDb/table"

curl -s -X PUT "$BASE_URL/$ENTITY/id/$ID" \
  -H "Content-Type: application/json" \
  -d "$JSON_DATA"