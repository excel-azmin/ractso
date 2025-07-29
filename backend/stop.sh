#!/bin/bash

# stop database
docker compose -f docker/docker-compose.yaml down

# stop application and other services
docker compose down