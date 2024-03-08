// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { WebVitalsInstrumentation } from '@honeycombio/opentelemetry-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { Resource, browserDetector } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SessionIdProcessor } from './SessionIdProcessor';
import { detectResourcesSync } from '@opentelemetry/resources/build/src/detect-resources';

const { NEXT_PUBLIC_OTEL_SERVICE_NAME = '' } =
  typeof window !== 'undefined' ? window.ENV : {};

const FrontendTracer = async () => {
  const { ZoneContextManager } = await import('@opentelemetry/context-zone');

  let resource = new Resource({
    [SEMRESATTRS_SERVICE_NAME]: NEXT_PUBLIC_OTEL_SERVICE_NAME,
  });

  const detectedResources = detectResourcesSync({ detectors: [browserDetector] });
  resource = resource.merge(detectedResources);
  const provider = new WebTracerProvider({
    resource
  });

  provider.addSpanProcessor(new SessionIdProcessor());

  provider.addSpanProcessor(
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: '/v1/traces',
      }), {
      scheduledDelayMillis: 500
    }
    )
  );

  provider.register({
    contextManager: new ZoneContextManager(),
  });

  console.log("Including CWV instrumentation")
  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
          applyCustomAttributesOnSpan(span) {
            //span.setAttribute('app.synthetic_request', IS_SYNTHETIC_REQUEST);
          },
        },
      }),
      new WebVitalsInstrumentation()
    ],
  });
};

export default FrontendTracer;
