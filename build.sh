#!/bin/bash
TAG=$1
ORG=$2

if [ -z "$TAG" ]; then
	TAG="latest"
fi

if [ -z "$ORG" ]; then
	ORG="oss-know"
fi


docker build -t $ORG/dashboard:$TAG ./
