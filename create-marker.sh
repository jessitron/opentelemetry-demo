curl https://api.honeycomb.io/1/markers/frontend-web -X POST  \
    -H "X-Honeycomb-Team: ${HONEYCOMB_API_KEY}"  \
    -d '{"message":"skaffold run", "type":"deploy"}'

