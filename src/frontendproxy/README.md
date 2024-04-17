# Frontend Proxy Service

This service acts as a reverse proxy for the various user-facing web interfaces.

## Modifying the Envoy Configuration

The envoy configuration is generated from the `envoy.tmpl.yaml` file in this
directory. Environment variables are substituted at deploy-time.

## Notes

I could make this serve a static file - chatgpt tells me how to do it.
But before I get it working, I learn that it won't get me the INP data I need anyway
and also our honeycomb-telemetry-web is not available on the CDN yet argh
