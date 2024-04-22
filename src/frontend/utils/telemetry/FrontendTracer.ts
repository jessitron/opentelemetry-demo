import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const sdk = new HoneycombWebSDK({
  apiKey: process.env["HONEYCOMB_API_KEY"],
  serviceName: 'frontend-web',
  instrumentations: [getWebAutoInstrumentations()],
});
sdk.start();
