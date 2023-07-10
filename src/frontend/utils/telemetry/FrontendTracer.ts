// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { Resource, detectResources, browserDetector } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SessionIdProcessor } from './SessionIdProcessor';
import { WebVitalsInstrumentation } from './CoreWebVitals';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
console.log("jessitron was here")

const { NEXT_PUBLIC_OTEL_SERVICE_NAME = '', NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '' } =
  typeof window !== 'undefined' ? window.ENV : {};

const FrontendTracer = async (collectorString: string) => {
  const { ZoneContextManager } = await import('@opentelemetry/context-zone');

  let resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: NEXT_PUBLIC_OTEL_SERVICE_NAME,
  });

  const detectedResources = await detectResources({ detectors: [browserDetector] });
  resource = resource.merge(detectedResources);
  const provider = new WebTracerProvider({
    resource,
  });

  provider.addSpanProcessor(new SessionIdProcessor());

  provider.addSpanProcessor(
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || collectorString || 'http://localhost:4318/v1/traces',
      })
    )
  );

  const contextManager = new ZoneContextManager();

  provider.register({
    contextManager,
    propagator: new CompositePropagator({
      propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
    }),
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      new WebVitalsInstrumentation(),
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          clearTimingResources: true,
          applyCustomAttributesOnSpan(span) {
            span.setAttribute('app.synthetic_request', 'false');
          },
        },
        '@opentelemetry/instrumentation-user-interaction': {
          eventNames: ['submit', 'click', 'keypress'],
          shouldPreventSpanCreation: (eventType, element, span) => {
            element['active_span'] = span; // jess does something weird. does this work? yes for clicks, no for submit
            span.setAttribute('target.id', element.id);
            span.setAttribute('target.className', element.className);
            span.setAttribute('target.html', element.outerHTML);
          },
        },
      }),
    ],
  });
};

export default FrontendTracer;
