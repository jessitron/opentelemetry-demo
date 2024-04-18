// Example filename: tracing.js
import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { SessionIdProcessor } from './SessionIdProcessor';

if (typeof window !== 'undefined') {
  const sdk = new HoneycombWebSDK({
    apiKey: 'hcaik_01htja3fyhkmj9mf2v1s27ag8wpkeazcvm9rbrzwfpeex8x5dx07rtende',
    serviceName: 'frontend-web',
    spanProcessor: new SessionIdProcessor(), // add custom span processor
    instrumentations: [getWebAutoInstrumentations()], // add automatic instrumentation
  });
  sdk.start();
}
