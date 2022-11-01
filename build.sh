#!/bin/bash
TAG=$1
ORG=$2

if [ -z "$TAG" ]; then
	TAG="latest"
fi

if [ -z "$ORG" ]; then
	ORG="oss-know"
fi


NODE_OPTIONS=--openssl-legacy-provider npm run build
docker build -t $ORG/dashboard:$TAG ./


#docker compose -f docker-compose.yaml down
#docker compose -f docker-compose.yaml up -d
