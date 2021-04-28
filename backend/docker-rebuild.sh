#!/bin/bash
imageName=confa-img
containerName=confa-api

docker build -t $imageName -f Dockerfile  .

psRes=$(docker ps -aq -f name="$containerName")

if [[ ! -z "$psRes" ]];
then
    echo "delete old conteiner ${containerName} ..."
    docker rm -fv $containerName
fi

echo Run new container...
docker run -d -p 49160:4000 --name $containerName $imageName
