#!/bin/bash

# sudo chown -R $(whoami):$(whoami) dist
# sudo chmod -R u+rwX dist


# run database
docker compose -f docker/docker-compose.yaml up -d

# run application and other services
docker compose up -d --build