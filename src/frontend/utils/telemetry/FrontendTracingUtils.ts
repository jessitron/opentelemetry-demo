import { Span, trace } from "@opentelemetry/api";

console.log("Hello, frontend tracing utils");

export const astronomyShopTracer = trace.getTracer('astronomy-shop');

export function inSpan<R>(name: string, cb: (s: Span) => R): R {
    console.log("inSpan was called ", name)
    return astronomyShopTracer.startActiveSpan(name, (s) => {
        try {
            return cb(s);
        } catch (e) {
            s.recordException(e as Error);
            throw e;
        } finally {
            s.end();
        }
    });
}

export function inSpanAsync<R>(
    name: string,
    cb: (s: Span) => Promise<R>
): Promise<R> {
    return astronomyShopTracer.startActiveSpan(name, async (s) => {
        try {
            return await cb(s);
        } catch (e) {
            s.recordException(e as Error);
            throw e;
        } finally {
            s.end();
        }
    });
}