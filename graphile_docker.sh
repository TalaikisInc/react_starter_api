#!/bin/bash

echo "-------------------------------------------------"
echo "How to call: ./graphile_docker.sh <name_of_container> <postgres_password> <database_name> <port>"
echo "-------------------------------------------------"

docker pull graphile/postgraphile
docker run --name $1 -p $4:5000 -d graphile/postgraphile --connection postgres://postgres:$2@127.0.0.1:5432/$3
