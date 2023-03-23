import { onFID, onLCP, onCLS, onINP, onTTFB } from 'web-vitals';
import {
  InstrumentationBase,
  InstrumentationModuleDefinition,
} from '@opentelemetry/instrumentation';
import { trace } from '@opentelemetry/api';
import { hrTime } from '@opentelemetry/core';

export class WebVitalsInstrumentation extends InstrumentationBase {
  protected init(): void | InstrumentationModuleDefinition<any> | InstrumentationModuleDefinition<any>[] {
    console.log('init web vitals, woo');
  }

  onReport(metric) {
    const now = hrTime();
    trace.getTracer('web-vitals-instrumentation').startActiveSpan(metric.name, { startTime: now }, span => {
      span.setAttributes({
        [`webvitals.${metric.name}.name`]: metric.name,
        [`webvitals.${metric.name}.id`]: metric.id,
        [`webvitals.${metric.name}.navigationType`]: metric.navigationType,
        [`webvitals.${metric.name}.delta`]: metric.delta,
        [`webvitals.${metric.name}.rating`]: metric.rating,
        [`webvitals.${metric.name}.value`]: metric.value,
        // can expand these into their own attributes!
        [`webvitals.${metric.name}.entries`]: JSON.stringify(metric.entries),
      });
      span.end();
    });
  }
  private enabled: boolean = false;
  enable() {
    if (this.enabled) {
      return;
    }
    this.enabled = true;
    onFID(metric => {
      this.onReport(metric);
    });
    onCLS(metric => {
      this.onReport(metric);
    });
    onLCP(metric => {
      this.onReport(metric);
    });
    onINP(metric => {
      this.onReport(metric);
    });
    onTTFB(metric => {
      this.onReport(metric);
    });
  }
}
