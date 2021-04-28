#!/bin/bash
imageName=confa-img
containerName=confa-rest

docker build -t $imageName -f Dockerfile  .

docker ps -aq -f name={$containerName}

if [ $? -eq 0 ];
then
    echo "delete old conteiner..."
    docker rm -fv $containerName
fi

echo Run new container...
docker run -d -p 49160:4000 --name $containerName $imageName
