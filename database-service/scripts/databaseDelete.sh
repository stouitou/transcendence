#!/bin/sh
# filepath: ./bin/databaseDelete.sh
# Usage: ./databaseDelete.sh <table> <id>
# Exemple: ./databaseDelete.sh user 3

if [ $# -ne 2 ]; then
  echo "Usage: $0 <table> <id> | jq"
  exit 1
fi

TABLE="$1"
ID="$2"

BASE_URL="http://localhost:3000/api/v2/database/myDb/table"

curl -s -X DELETE "$BASE_URL/$TABLE/id/$ID"