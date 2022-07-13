#!/usr/bin/env sh

CONTAINERNAME="iotDataIngestor"
IMAGENAME="iotDataIngestor"

if docker ps -a | grep -q -i $CONTAINERNAME
then
    docker stop $CONTAINERNAME ; docker rm $CONTAINERNAME 
fi

docker run --name $CONTAINERNAME --restart always -d -t $IMAGENAME