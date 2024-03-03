// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { NextApiHandler } from 'next';
import { context, Exception, propagation, Span, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { metrics } from '@opentelemetry/api';
import { AttributeNames } from '../enums/AttributeNames';

const meter = metrics.getMeter('frontend');
const requestCounter = meter.createCounter('app.frontend.requests');

// make this into a no-op, I don't want a bunch of manual stuff
const InstrumentationMiddleware = (handler: NextApiHandler): NextApiHandler => {
  return handler;
};

export default InstrumentationMiddleware;
