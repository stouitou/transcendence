#!/bin/sh
# filepath: ./bin/userRole.sh
# Usage: ./userRole.sh <user_id> <role>
# Exemple: ./userRole.sh 3 admin

if [ $# -ne 2 ]; then
  echo "Usage: $0 <user_id> <role>"
  exit 1
fi

USER_ID="$1"
ROLE="$2"
if [ "$ROLE" != "user" ] && [ "$ROLE" != "admin" ]; then
  echo "Error: role must be 'user' or 'admin'"
  exit 2
fi

curl -s -X PUT "http://localhost:3000/api/v2/database/myDb/table/user/id/$USER_ID" \
  -H "Content-Type: application/json" \
  -d "{\"role\":\"$ROLE\"}"