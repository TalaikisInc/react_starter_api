#!/bin/bash

echo "-------------------------------------------------"
echo "How to call: ./postgres_docker.sh <name_of_container> <postgres_password>"
echo "-------------------------------------------------"

sudo apt-get remove docker docker-engine docker.io -y
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl software-properties-common -y
sudo apt-get install postgresql-client -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install docker-ce -y
sudo usermod -aG docker root
docker pull postgres:alpine
mkdir /home/$1
mkdir /home/$1/postgresql
mkdir /home/$1/postgresql/data
docker run --name $1 -v /home/$1/postgresql/data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=$2 -p 5432:5432 -d postgres:alpine
