// Example filename: tracing.js
import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const sdk = new HoneycombWebSDK({
  apiKey: 'hcaik_01htja3fyhkmj9mf2v1s27ag8wpkeazcvm9rbrzwfpeex8x5dx07rtende',
  serviceName: 'frontend-web',
  instrumentations: [getWebAutoInstrumentations()], // add automatic instrumentation
});
sdk.start();
