### Initialiser un nouveau container

1- copier le contenu de ce dossier ./container.template dans le dossier cible

ex: test-service
(ou copier / coller / rename test-service)



2- executer depuis le dossier ./test-service/app la commande
``` sh
cd test-service/app && bash ../scripts/init_dev.sh
```

3- ajouter ce container au docker-compose

ATTENTION INDENTATION

``` yaml
##
  test_services:
    build:
      context: ./test-service
      dockerfile: ./Dockerfile
    container_name: test_service
    environment:
      - NODE_ENV=development
    depends_on:
      - backend_services
    volumes:
      - ./test-service/app:/app
      - ./test-service/app/node_modules:/app/node_modules
    networks:
      - transcendence_network
```

4- lier le service a nginx
fichier de conf nginx: 

./nginx/templates/sslapibackend.conf.template

``` conf
    location /path_to_service/ {
        proxy_pass http://test_service:3000;        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
```

sera accessible depuis un navigateur a l'url

https://localhost:4433/path_to_service/ping