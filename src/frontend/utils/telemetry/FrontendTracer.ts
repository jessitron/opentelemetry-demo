'use client';
// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
console.log("jessitron was here ya");

import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

if (typeof window !== 'undefined') {

  const sdk = new HoneycombWebSDK({
    endpoint: "/v1/traces",
    serviceName: "frontend-web",
    skipOptionsValidation: true, // because we are not including apiKey
    instrumentations: [getWebAutoInstrumentations()], // add automatic instrumentation
  });
  sdk.start();
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
}
const FrontendTracer = () => { console.log("frontend tracer is a no-op right now") };
export default FrontendTracer;
