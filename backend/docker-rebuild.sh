#!/bin/bash
imageName=confa-img
containerName=confa-api

GREEN=`tput setaf 2`
YELLOW=`tput setaf 3`
NC='\033[0m' # No Color

docker build -t $imageName -f Dockerfile  .

psRes=$(docker ps -aq -f name="$containerName")

if [[ ! -z "$psRes" ]];
then
    printf "${YELLOW}delete old container${NC} $containerName"
    docker rm -fv $containerName
fi

printf "${GREEN}Run new container... ${NC} $containerName "
docker run -d -p 49160:4000 --name $containerName $imageName
