#!/bin/bash

ref=$(git rev-parse HEAD)
body=$(echo '{"message":"ref' $ref '", "type":"deploy"}')

echo $body

curl -vv https://api.honeycomb.io/1/markers/frontend-web -X POST  \
    -H "X-Honeycomb-Team: ${HONEYCOMB_API_KEY}"  \
    -d "$body"

