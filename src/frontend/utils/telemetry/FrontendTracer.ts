// Example filename: tracing.js
import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { SessionIdProcessor } from './SessionIdProcessor';

if (typeof window !== 'undefined') {
  console.log("Starting Honeycomb SDK");
  const sdk = new HoneycombWebSDK({
    apiKey: 'hcaik_01htja3fyhkmj9mf2v1s27ag8wpkeazcvm9rbrzwfpeex8x5dx07rtende',
    serviceName: 'frontend-web',
    spanProcessor: new SessionIdProcessor(), // add custom span processor
    instrumentations: [getWebAutoInstrumentations()], // add automatic instrumentation
    debug: true,
    // webVitalsInstrumentationConfig: {
    //   inp: {
    //     reportAllChanges: true,
    //     applyCustomAttributes: (vital, span) => { // this function is required? whatever
    //       console.log("Received INP", vital.name, vital.value, span.spanContext().traceId);
    //     },
    //   },
    //   cls: {
    //     reportAllChanges: true,
    //     applyCustomAttributes: (vital, span) => { // this function is required? whatever
    //       console.log("Received CLS", vital.name, vital.value, span.spanContext().traceId);
    //     },
    //   },
    //   lcp: {
    //     reportAllChanges: true,
    //     applyCustomAttributes: (vital, span) => {
    //       // from the example
    //       console.log("Received LCP", vital.name, vital.value, span.spanContext().traceId);
    //       if (vital.value < 1000) {
    //         span.setAttribute('lcp.custom_rating', 'good');
    //       } else if (vital.value < 3000) {
    //         span.setAttribute('lcp.custom_rating', 'needs-improvement');
    //       } else {
    //         span.setAttribute('lcp.custom_rating', 'poor');
    //       }
    //     },
    //   },
    // },
  });
  sdk.start();
} else {
  console.log("\n   Not loading SDK because we are the server  \n");
}
