#!/bin/sh
# filepath: ./bin/databaseGet.sh
# Usage: ./databaseGet.sh <entity> [id] [query]
# Exemple: ./databaseGet.sh user
#          ./databaseGet.sh user 1
#          ./databaseGet.sh user "" 'relations=authProviders&filters={"id":"4"}'
#          ./databaseGet.sh user 1 'relations=authProviders'

if [ $# -lt 1 ]; then
  echo "Usage: $0 <entity> [id] [query]  | jq"
  echo "Example: $0 user  | jq"
  echo "         $0 user 1 | jq"
  echo "         $0 user '' 'relations=authProviders&filters={\"id\":\"4\"}' | jq"
  echo "         $0 user 1 'relations=authProviders' | jq"
  exit 1
fi

ENTITY="$1"
ID="$2"
QUERY="$3"

BASE_URL="http://localhost:3000/api/v2/database/myDb/table"

if [ -n "$ID" ]; then
  URL="$BASE_URL/$ENTITY/id/$ID"
else
  URL="$BASE_URL/$ENTITY"
fi

if [ -n "$QUERY" ]; then
  # Encodage propre de filters=...
  FILTERS=$(echo "$QUERY" | grep -o 'filters={.*}' | sed 's/filters=//')
  if [ -n "$FILTERS" ]; then
    ENCODED=$(echo "$FILTERS" | jq -sRr @uri)
    # Remplacer seulement la portion filters=...
    QUERY=$(echo "$QUERY" | sed "s|filters={.*}|filters=$ENCODED|")
  fi

  URL="$URL?$QUERY"
fi

curl -s "$URL"