'use client';
// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
console.log("jessitron was here ya");

const { NEXT_PUBLIC_OTEL_SERVICE_NAME = '', NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '', IS_SYNTHETIC_REQUEST = '' } =
  typeof window !== 'undefined' ? window.ENV : {};

// JESS TODO: insert Honeycomb recommended code instead.

import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const provider = new WebTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

provider.register({
  // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
  contextManager: new ZoneContextManager(),
});

// Registering instrumentations
registerInstrumentations({
  instrumentations: [new DocumentLoadInstrumentation()],
  
});
// but still do these...

// Add session ID:
// provider.addSpanProcessor(new SessionIdProcessor());

// send to the collector:
// new BatchSpanProcessor(
//   new OTLPTraceExporter({
//     url: NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || collectorString || '/v1/traces',
//   }), {
//       scheduledDelayMillis : 500
//     }


// for my talk, consider implementing something to replace this:
// new UserInteractionInstrumentation({
//   eventNames: ['submit', 'click', 'keypress'],
//   shouldPreventSpanCreation: (eventType, element, span) => {
//     element['active_span'] = span; // jess does something weird. does this work? yes for clicks, no for submit
//     span.setAttribute('target.id', element.id);
//     span.setAttribute('target.className', element.className);
//     span.setAttribute('target.html', element.outerHTML);
//   },
// })
const FrontendTracer = () => { console.log("frontend tracer is a no-op right now") };
export default FrontendTracer;
