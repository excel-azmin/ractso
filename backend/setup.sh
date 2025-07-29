#!/bin/bash

# create docker network
docker network backbone-network

# run database
docker compose -f docker/docker-compose.yaml up -d

# run application and other services
docker compose up -d --build
