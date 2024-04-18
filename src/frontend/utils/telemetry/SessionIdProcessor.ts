// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { Context } from "@opentelemetry/api";
import { ReadableSpan, Span, SpanProcessor } from "@opentelemetry/sdk-trace-web";
import SessionGateway from "../../gateways/Session.gateway";
import { AttributeNames } from "../enums/AttributeNames";

const { userId } = SessionGateway.getSession();

let loggedIn = false;
let loggedInUserId = undefined;
const r = Math.random();
console.log("random:", r);
if (r < 0.45) {
    console.log("Pretending the user is logged in")
    loggedIn = true;
    loggedInUserId = userId.substring(0, 8);
}

export class SessionIdProcessor implements SpanProcessor {
    forceFlush(): Promise<void> {
        return Promise.resolve();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onStart(span: Span, parentContext: Context): void {
        span.setAttribute(AttributeNames.SESSION_ID, userId);
        span.setAttributes({"app.user.logged_in": loggedIn, "app.user.id": loggedInUserId })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    onEnd(span: ReadableSpan): void {}

    shutdown(): Promise<void> {
        return Promise.resolve();
    }
}
