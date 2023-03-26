import { onFID, onLCP, onCLS, onINP, onTTFB } from 'web-vitals';
import { InstrumentationBase, InstrumentationModuleDefinition } from '@opentelemetry/instrumentation';
import { trace, context, Tracer } from '@opentelemetry/api';
import { hrTime } from '@opentelemetry/core';

export class WebVitalsInstrumentation extends InstrumentationBase {
  constructor() {
    super('web-vitals-instrumentation', 'v0.1.0');
  }
  protected init(): void | InstrumentationModuleDefinition<any> | InstrumentationModuleDefinition<any>[] {
    console.log('init web vitals, woo');
  }
  private enabled: boolean = false;
  
  onReport(metric, parentSpanContext) {
    const now = hrTime();
    const webVitalsSpan = this.tracer.startSpan(metric.name, { startTime: now }, parentSpanContext);

    webVitalsSpan.setAttributes({
      [`webvitals.${metric.name}.name`]: metric.name,
      [`webvitals.${metric.name}.id`]: metric.id,
      [`webvitals.${metric.name}.navigationType`]: metric.navigationType,
      [`webvitals.${metric.name}.delta`]: metric.delta,
      [`webvitals.${metric.name}.rating`]: metric.rating,
      [`webvitals.${metric.name}.value`]: metric.value,
      // can expand these into their own attributes!
      [`webvitals.${metric.name}.entries`]: JSON.stringify(metric.entries),
    });
    webVitalsSpan.end();
  }

  enable() {
    if (this.enabled) {
      return;
    }
    this.enabled = true;

    // create a parent span that will have all web vitals spans as children
    const parentSpan = this.tracer.startSpan('web-vitals');
    // What the next step should be: const ctx = parentSpan.spanContext();
    // what the next step is:
    const ctx = trace.setSpan(context.active(), parentSpan);
    // I think this is a bug in the otel libraries. There's a "getValue not defined" error in the browser
    // when passing only the context, without making it the active span for an instant here.
    // maybe the context manager doesn't save it?
    parentSpan.end();

    onFID(metric => {
      this.onReport(metric, ctx);
    });
    onCLS(metric => {
      this.onReport(metric, ctx);
    });
    onLCP(metric => {
      this.onReport(metric, ctx);
    });
    onINP(metric => {
      this.onReport(metric, ctx);
    });
    onTTFB(metric => {
      this.onReport(metric, ctx);
    });
  }
}
