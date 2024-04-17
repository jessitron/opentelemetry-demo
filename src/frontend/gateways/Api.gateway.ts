// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { trace } from '@opentelemetry/api';
import { Ad, Address, Cart, CartItem, Money, PlaceOrderRequest, Product } from '../protos/demo';
import { IProductCart, IProductCartItem, IProductCheckout } from '../types/Cart';
import request from '../utils/Request';
import { OtelContext, inSpanContextAsync } from '../utils/telemetry/FrontendTracingUtils';
import SessionGateway from './Session.gateway';

// is this even USED??

const { userId } = SessionGateway.getSession();

const basePath = '/api';

const ApiGateway = () => ({
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
    let randomDelay = Math.floor(Math.random() * 1000);
    if (currencyCode.startsWith('U')) {
      randomDelay = 0;
    }
    console.log("Let us be slow " + randomDelay + "ms")
    trace.getActiveSpan().setAttributes({ 'jess.delay': randomDelay, 'jess.currencyCode': currencyCode});
    return new Promise<Product>((resolve) => {
      setTimeout(() => {
        resolve(request<Product>({
          url: `${basePath}/products/${productId}`,
          queryParams: { currencyCode },
        }));
      }, randomDelay);
    });
  },
  listRecommendations(productIds: string[], currencyCode: string) {
    return request<Product[]>({
      url: `${basePath}/recommendations`,
      queryParams: {
        productIds,
        sessionId: userId,
        currencyCode
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

export default ApiGateway();
