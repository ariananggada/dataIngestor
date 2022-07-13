#!/usr/bin/env sh
IMAGENAME="iotDataIngestor"
docker build --rm -t $IMAGENAME:latest . --no-cache
