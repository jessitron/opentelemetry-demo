// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { trace } from '@opentelemetry/api';
import { Ad, Address, Cart, CartItem, Money, PlaceOrderRequest, Product } from '../protos/demo';
import { IProductCart, IProductCartItem, IProductCheckout } from '../types/Cart';
import request from '../utils/Request';
import { OtelContext, inSpanContextAsync } from '../utils/telemetry/FrontendTracingUtils';
import { AttributeNames } from '../utils/enums/AttributeNames';
import SessionGateway from './Session.gateway';
import { context, propagation } from "@opentelemetry/api";

// is this even USED??

const { userId } = SessionGateway.getSession();

const basePath = '/api';

const Apis = () => ({
  getCart(currencyCode: string) {
    return request<IProductCart>({
      url: `${basePath}/cart`,
      queryParams: { sessionId: userId, currencyCode },
    });
  },
  addCartItem({ currencyCode, ...item }: CartItem & { currencyCode: string }) {
    return request<Cart>({
      url: `${basePath}/cart`,
      body: { item, userId },
      queryParams: { currencyCode },
      method: 'POST',
    });
  },
  emptyCart({ otelContext }: OtelContext) {
    return inSpanContextAsync("DELETE /cart", otelContext, () =>
      request<undefined>({
        url: `${basePath}/cart`,
        method: 'DELETE',
        body: { userId },
      }));
  },

  getSupportedCurrencyList() {
    return request<string[]>({
      url: `${basePath}/currency`,
    });
  },

  getShippingCost(itemList: IProductCartItem[], currencyCode: string, address: Address) {
    return request<Money>({
      url: `${basePath}/shipping`,
      queryParams: {
        itemList: JSON.stringify(itemList.map(({ productId, quantity }) => ({ productId, quantity }))),
        currencyCode,
        address: JSON.stringify(address),
      },
    });
  },

  placeOrder({ currencyCode, ...order }: PlaceOrderRequest & { currencyCode: string }) {
    return request<IProductCheckout>({
      url: `${basePath}/checkout`,
      method: 'POST',
      queryParams: { currencyCode },
      body: order,
    });
  },

  listProducts(currencyCode: string) {
    return request<Product[]>({
      url: `${basePath}/products`,
      queryParams: { currencyCode },
    });
  },

  // when is this called??
  getProduct(productId: string, currencyCode: string) {
    // let randomDelay = Math.floor(Math.random() * 1000);
    // if (currencyCode.startsWith('U')) {
    //   randomDelay = 0;
    // }
    // console.log("Let us be slow " + randomDelay + "ms")
    // const span =  trace.getTracer("jess").startSpan("jess adds a weird delay");
    // span.setAttributes({ 'jess.delay': randomDelay, 'jess.currencyCode': currencyCode, 'jess.productId': productId});
    // return new Promise<Product>((resolve) => {
    //   setTimeout(() => {
    //     span.end();
    //     resolve(request<Product>({
    //       url: `${basePath}/products/${productId}`,
    //       queryParams: { currencyCode },
    //     }));
    //   }, randomDelay);
    // });

    return request<Product>({
      url: `${basePath}/products/${productId}`,
      queryParams: { currencyCode },
    })
  },
  listRecommendations(productIds: string[], currencyCode: string) {
    return request<Product[]>({
      url: `${basePath}/recommendations`,
      queryParams: {
        productIds,
        sessionId: userId,
        currencyCode,
      },
    });
  },
  listAds(contextKeys: string[]) {
    return request<Ad[]>({
      url: `${basePath}/data`,
      queryParams: {
        contextKeys,
      },
    });
  },
});

/**
 * Extends all the API calls to set baggage automatically.
 */
const ApiGateway = new Proxy(Apis(), {
  get(target, prop, receiver) {
    const originalFunction = Reflect.get(target, prop, receiver);

    if (typeof originalFunction !== 'function') {
      return originalFunction;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (...args: any[]) {
      const baggage = propagation.getActiveBaggage() || propagation.createBaggage();
      const newBaggage = baggage.setEntry(AttributeNames.SESSION_ID, { value: userId });
      const newContext = propagation.setBaggage(context.active(), newBaggage);
      return context.with(newContext, () => {
        return Reflect.apply(originalFunction, undefined, args);
      });
    };
  },
});

export default ApiGateway;
