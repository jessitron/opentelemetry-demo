#!/bin/bash

set -e
set -x

ECR_URL=414852377253.dkr.ecr.$(aws configure get region).amazonaws.com
REPO_NAME=frontend

# only needs to be done once per hr or so, but it's SO PAINFUL when I forget
aws ecr get-login-password --region $(aws configure get region) | docker login --username AWS --password-stdin $ECR_URL

# Done once:
# aws ecr create-repository --repository-name $REPO_NAME

# do the build, two levels up, it expects that
docker build -t $REPO_NAME -f ./Dockerfile ../..

# push to ECR
sha=$(git rev-parse HEAD)
whole_docker_id=$ECR_URL/$REPO_NAME:$sha
docker tag $REPO_NAME $whole_docker_id
docker push $whole_docker_id

cat ./deployment.yaml | sed "s#TAGGYDOOBER#$whole_docker_id#" | kubectl apply -f -
