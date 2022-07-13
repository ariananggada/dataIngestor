#!/usr/bin/env sh
IMAGENAME="iotdataingestor-devo"
docker build --rm -t $IMAGENAME:latest . --no-cache
