#!/bin/bash
echo "Stopping and removing the containers"
docker-compose down --volumes
echo "Building the images and starting the containers"
docker-compose up --build
