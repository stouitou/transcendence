FILE=./docker-compose.override.yml
#FILE=./docker-compose.yml

dev : 
	echo "Stopping and removing the containers"
	docker-compose down --volumes
	echo "Building the images and starting the containers"
	docker-compose up --build

all : build

# Build the images and start the containers
# -f flag is used to specify the file to use
# -d flag is used to start the containers in the background
# --build flag is used to build the images before starting the containers
# --remove-orphans flag is used to remove containers for services not defined in the Compose file
# --force-recreate flag is used to recreate containers even if their configuration and image haven't changed
build :	
	docker-compose -f $(FILE) build 
	docker-compose -f $(FILE) up -d
	@echo "Cleaning up intermediate images..."
	docker image prune -af

clean :
	docker-compose -f $(FILE) down

fclean : clean
	docker system prune -af

re : fclean build

# stop and remove all containers, images, volumes and networks
clean-docker:
	@docker stop $$(docker ps -qa) 2>/dev/null || true
	@docker rm $$(docker ps -qa) 2>/dev/null || true
	@docker rmi -f $$(docker images -qa) 2>/dev/null || true
	@docker volume rm $$(docker volume ls -q) 2>/dev/null || true
	@docker network rm $$(docker network ls -q | grep -v bridge | grep -v host | grep -v none) 2>/dev/null || true
clean-node:
	@rm -rf ./auth-service/app/node_modules ./database-service/app/node_modules ./frontend-pong-module/app/node_modules ./frontend-services-myframeworks/app/node_modules ./game-management-service/app/node_modules ./user-management-service/app/node_modules ./ws-service/app/node_modules
	@mkdir -p ./auth-service/app/node_modules ./database-service/app/node_modules ./frontend-pong-module/app/node_modules ./frontend-services-myframeworks/app/node_modules ./game-management-service/app/node_modules ./user-management-service/app/node_modules ./ws-service/app/node_modules
# Docker compose commands
start:
	docker-compose -f $(FILE) up -d
stop:
	docker-compose -f $(FILE) down
restart:
	docker-compose -f $(FILE) down
	docker-compose -f $(FILE) up -d
ps:
	docker-compose -f $(FILE) ps
# Docker commands
#exec shell command
exec:
	@echo "Available containers:"; \
	docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}"; \
	echo ""; \
	read -p "Enter container ID or name: " container_name; \
	docker exec -it $$container_name /bin/sh
#logs command
logs:
	@echo "Available containers:"; \
	docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}"; \
	echo ""; \
	read -p "Enter container ID or name: " container_name; \
	docker logs -f $$container_name
