#!/bin/bash
imageName=confa-img
containerName=confa-api
RED='\033[0;31m'
NC='\033[0m' # No Color

GREEN=`tput setaf 2`
YELLOW=`tput setaf 3`
RESET=`tput sgr0`

docker build -t $imageName -f Dockerfile  .

psRes=$(docker ps -aq -f name="$containerName")

if [[ ! -z "$psRes" ]];
then
    printf "${YELLOW}delete old container${RESET} $containerName"
    docker rm -fv $containerName
fi

printf "${GREEN}Run new container... ${RESET} $containerName "
docker run -d -p 49160:4000 --name $containerName $imageName
