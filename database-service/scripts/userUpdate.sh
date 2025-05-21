#!/bin/sh
# filepath: ./bin/userUpdate.sh
# This script updates a user in the database using a PUT request.
# It requires two arguments: the user ID and the JSON data to update.
# Usage: ./userUpdate.sh <user_id> <json_data>
# Example: ./userUpdate.sh 123 '{"name": "John Doe", "role": "admin"}'

if [ $# -lt 2 ]; then
  echo "Usage: $0 <user_id> <json_data> | jq"
  echo "Example: $0 1 '{\"name\": \"John Doe\", \"role\": \"admin\"}' | jq"
  exit 1
fi

USER_ID="$1"
JSON_DATA="$2"

curl -s -X PUT "http://localhost:3000/api/v2/database/myDb/table/user/id/$USER_ID" \
  -H "Content-Type: application/json" \
  -d "$JSON_DATA"