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
  private tracer: Tracer;

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
    this.tracer = trace.getTracer('web-vitals-instrumentation');
    const parentSpan = this.tracer.startSpan('web-vitals');
    const ctx = trace.setSpan(context.active(), parentSpan);
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
