#!/bin/sh

# Appliquer envsubst sur tous les fichiers dans /etc/nginx/templates/
for file in /etc/nginx/templates/*.template; do
    dest="/etc/nginx/conf.d/$(basename "$file" .template)"
    echo "Processing $file -> $dest"
    envsubst '$BACKEND_SERVER_NAME $BACKEND_SERVER_NAME_API $BACKEND_SERVER_SSH_PORT $BACKEND_SERVER_PORT' < "$file" > "$dest"
done

# Lancer NGINX
exec nginx -g 'daemon off;'
