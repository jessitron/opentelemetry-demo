# Making shit do things

OK fuck skaffold. Goddammit. It does way too much and takes way too long.

All I want to do is deploy the frontend service.

Now there's a script deploy-frontend.sh, and a deployment.yaml, in src/frontend

This will push an image and then alter the deployment to use it. Just for the one service. It won't try to restart the whole fucking helm chart.


# changes i made

OK, I brought in a skaffold.yaml (copied Martin's from martinjt fork)

My objective is to change frontend tracing; so I want to update and build and deploy
the frontend service.

To do this, I'm gonna change the values.yaml that I pass to helm (in my infra repo)
to use a different image repository.
That image repository will be the one associated with my AWS (sandbox) account, in the
region that I'm running my eks cluster.

First, I'll push all the images in opentelemetry-demo to that repository.
To do that, I have to create a repository for each image. If I don't do this, skaffold will fail annoyingly, sometimes with 'EOF'.

`grep image: skaffold.yaml | cut -d : -f 2 | xargs -L 1 aws ecr create-repository --repository-name`

Check that they exist:

`aws ecr describe-repositories`

Snag the repositoryUri out of one of those. You want the prefix, the part up to but not including the last '/'

Use that to configure skaffold to push here. This can be env var or:

`skaffold config set default-repo whatever.blah.com/maybesomeprefix`

This will configure skaffold for the current kube context. Check it with:

`skaffold config list`

Then I installed the latest skaffold.

Now I'm gonna install all the images from this version of opentelemetry-demo into that repository.
This way, if new ones are released by opentelemetry-demo, I won't get those. I need control
over this, so they stay compatible.
My intention is to minimize changes here and merge open-telemetry/opentelemetry-demo in regularly. ish.

The ever-needed login to the docker, without which skaffold will fail slowly and annoyingly:

`aws ecr get-login-password | docker login --username AWS --password-stdin whatever.repository.url.com`

The `--cache-artifacts` says, don't rebuild shit. Just try the push again.
The `--label skaffold.dev/run-id=...` says, don't generate a unique ID, put it in all the YAML, and cause helm to
restart every stinking deployment even though they haven't changed.

`skaffold run --cache-artifacts --label skaffold.dev/run-id=dammit-skaffold-stop-restarting-everything`

In order to get the builds to run one at a time and stop canceling each other when one failed,
I added to skaffold.yaml:

```
build:
  local:
    concurrency: 1
```

In order to get it to (hopefully) stop retrying a failed push over and over, I defined

`export SKAFFOLD_GOOGLE_CLOUD_BUILD_RETRY=0`

I'm not entirely sure that does anything, and I got that info from ChatGPT, so... sketch.

I had problems building emailservice; changing to Dockerfile helped.

I have problems building adservice and the Docker error makes no sense.

In the end, i don't think I need to build anything from the frontend.

I want to tell my installation to use the regular otel demo images, but at a specific version.

The images all go in the same image repository, and then the tags contain both the version and the service name. This is nonstandard and confusing. Maybe it's a github restriction? So, for most services, I want to override the image name (to fix the version of otel-demo) but not the repo; let that be ghcr.io/opentelemetry/opentelemetry-demo. The name should be $IMAGE_VERSION-$SERVICE_NAME_IN_LOWERCASE where $IMAGE_VERSION is in .env in this repo.

I could override that here in skaffold.yaml, or maybe in my helm installation? ... when skaffold runs Helm, how does it keep the values that I put in my original install?

OK, in skaffold.yaml, I referenced the values.yaml in an adjacent repo.
Not something that makes sense for anyone else but it works for me here.

### frontend messing-around

OK. With Purvi, I added some banana spans to the CartDropdown.tsx

The "Try Some Shit" button only appears when the screen width is low. I don't know how that CSS gets applied.

If you click it, you get a couple spans about bananas. They're separate from each other and from the click that caused them.

I'd like to try:

[x] use Promise or setTimeout to make something async, and see if the ZoneContextManager works for it. (yes; see bananas)

[] modify React (like in my node_modules) and see if I can get it to tack the context onto the state. (so hard, plus then I have to get it to deploy with local node_modules)

[x] in the click instrumentation, if I add the span context to the element (in FrontendTracer.js) then can I pull that out in the onClick method and use it? (yes; see CartDropdown.tsx)

For this, I should get it running locally, but calling into services that run in k8s. If I set env vars as in the FE pod in k8s, this should be doable. That's
the next thing to try. <- this doesn't work because it wants to call into them with gRPC... that sounds hard. They aren't exposed.

#### running locally

copy in the protobuf definitions:

`cp -r ../../pb .`

`next dev`

This doesn't do much because no services


# upgrading this repo

I want to bring in the latest changes from open-telemetry/opentelemetry-demo

I can `git fetch --all` and `git merge otel/main` to merge the changes in

I can find the latest release of the demo at [https://github.com/open-telemetry/opentelemetry-demo/releases]()
but I'm not sure what that accomplishes

This page looks useful: https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-demo/UPGRADING.md

Updating the helm chart version in skaffold.yamlst


Pull in the latest chart:

` helm repo update open-telemetry`

looks like I should first

(from ../infra/otel-demo-helm)

`helm uninstall otel-demo`

and then 

`helm install otel-demo open-telemetry/opentelemetry-demo --values values.yaml` (with the new chart version)

... then there were various errors with kubernetes so I'm destroying and rebuilding the cluster

