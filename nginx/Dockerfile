# Utiliser l'image de base Debian oldstable
FROM debian:oldstable

ARG DEBIAN_FRONTEND=noninteractive
# Mettre à jour les paquets et installer Nginx et OpenSSL
RUN apt-get update && apt-get upgrade -y && \
	apt-get install -y --no-install-recommends apt-utils && \
    apt-get install -y --no-install-recommends nginx openssl curl gettext && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de configuration Nginx dans le répertoire /etc/nginx/conf.d/ du conteneur
COPY  ./conf/nginx.conf /etc/nginx/nginx.conf
COPY  ./templates /etc/nginx/templates
COPY  ./proxy /etc/nginx/conf/configProxy
#COPY  ./conf/default.conf /etc/nginx/conf.d/
#COPY  ./conf/localhost.conf /etc/nginx/conf.d/

# Copier les certificats SSL dans le conteneur
#COPY ./ssl/ /etc/nginx/ssl/

# Générer un certificat SSL auto-signé
# Crée le répertoire /etc/nginx/ssl s'il n'existe pas déjà
RUN mkdir -p /etc/nginx/ssl && \
	# Génère une nouvelle clé privée RSA de 2048 bits et un certificat auto-signé valide pour 365 jours
	# -x509 : Crée un certificat auto-signé
	# -nodes : Ne pas crypter la clé privée
	# -days 365 : La durée de validité du certificat en jours
	# -newkey rsa:2048 : Crée une nouvelle clé privée RSA de 2048 bits
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
	# Spécifie le fichier de sortie pour la clé privée
	-keyout /etc/nginx/ssl/transcendence.key \
	# Spécifie le fichier de sortie pour le certificat
	-out /etc/nginx/ssl/transcendence.crt \
	# Spécifie les informations du certificat
	# /C=FR : Pays
	# /ST=IDF : État
	# /L=Paris : Ville
	# /O=42 : Organisation
	# /OU=42 : Unité d'organisation
	# /CN=nbrigui : Nom commun
	# /UID=nbrigui@student.42.fr : Identifiant unique
	-subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=nbrigui/UID=nbrigui@student.42.fr"

# Copier les fichiers du site web dans le répertoire approprié
#COPY ./nginx/html/ /var/www/html/


# Définir les permissions de lecture et d'écriture
# Change le propriétaire des fichiers et répertoires en www-data (l'utilisateur par défaut de Nginx) 
# et donne les permissions de lecture et d'écriture à l'utilisateur et les permissions de lecture aux autres
RUN chown -R www-data:www-data /var/www && chmod -R 755 /var/www

# Exposer le port 443
EXPOSE 443

# Démarrer Nginx et le laisser en premier plan
# -g daemon off : Démarrer Nginx en mode non démon
# Cela permet à Nginx de rester en premier plan et de rediriger les journaux vers la sortie standard
# 'ENTRYPOINT' Commande Immuable : ["nginx", "-g", "daemon off;"] sera exécutée à chaque démarrage du conteneur
# et ne peut pas être remplacée par une autre commande
# 'CMD' Commande Mutable : ["nginx", "-g", "daemon off;"] peut être remplacée par une autre commande
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
#ENTRYPOINT ["nginx", "-g", "daemon off;"]