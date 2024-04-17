// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { MouseEventHandler, useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Ad from '../../../components/Ad';
import Footer from '../../../components/Footer';
import Layout from '../../../components/Layout';
import ProductPrice from '../../../components/ProductPrice';
import Recommendations from '../../../components/Recommendations';
import Select from '../../../components/Select';
import { CypressFields } from '../../../utils/Cypress';
import ApiGateway from '../../../gateways/Api.gateway';
import { Product } from '../../../protos/demo';
import AdProvider from '../../../providers/Ad.provider';
import { useCart } from '../../../providers/Cart.provider';
import * as S from '../../../styles/ProductDetail.styled';
import { useCurrency } from '../../../providers/Currency.provider';
import { context, trace, Span } from '@opentelemetry/api';

const quantityOptions = new Array(10).fill(0).map((_, i) => i + 1);

type OnClickHandler = MouseEventHandler<HTMLSpanElement>; // something
function inSpanSnuckOntoTheEvent(f: OnClickHandler): OnClickHandler {
  return event => {
    const sneakySpan = event.target['active_span'] as Span;
    console.log('Product. Looking for a sneaky span. Did I find one? ', sneakySpan);
    if (!sneakySpan) {
      return f(event);
    }
    context.with(trace.setSpan(context.active(), sneakySpan), () => f(event));
  };
}

const tracer = trace.getTracer('push tracer');
function recordPush(push: (u: string) => Promise<boolean>): (url: string) => Promise<boolean> {
  return u =>
    tracer.startActiveSpan('push', s => {
      s.setAttribute('app.pushUrl', u);
      return push(u).then(b => {
        s.setAttribute('app.pushReturned', b);
        s.end();
        return b;
      });
    });
}

const ProductDetail: NextPage = () => {
  const { push: realPush, query } = useRouter();
  const push = recordPush(realPush);
  const [quantity, setQuantity] = useState(1);
  const {
    addItem,
    cart: { items },
  } = useCart();
  const { selectedCurrency } = useCurrency();
  const productId = query.productId as string;

  const {
    data: {
      name,
      picture,
      description,
      priceUsd = { units: 0, currencyCode: 'USD', nanos: 0 },
      categories,
    } = {} as Product,
  } = useQuery(
    ['product', productId, 'selectedCurrency', selectedCurrency],
    () => ApiGateway.getProduct(productId, selectedCurrency),
    {
      enabled: !!productId,
    }
  );

  // don't useCallback. Just don't complicate this. it can be a function, what is so terrible
  const onAddItem = async () => {
    await addItem({
      productId,
      quantity,
    });
    push('/cart');
  };

  return (
    <AdProvider
      productIds={[productId, ...items.map(({ productId }) => productId)]}
      contextKeys={[...new Set(categories)]}
    >
      <Layout>
        <S.ProductDetail data-cy={CypressFields.ProductDetail}>
          <S.Container>
            <S.Image id="product-picture" $src={"/images/products/" + picture} data-cy={CypressFields.ProductPicture} />
            <S.Details>
              <S.Name data-cy={CypressFields.ProductName}>{name}</S.Name>
              <S.Description data-cy={CypressFields.ProductDescription}>{description}</S.Description>
              <S.ProductPrice>
                <ProductPrice price={priceUsd} />
              </S.ProductPrice>
              <S.Text>Quantity</S.Text>
              <Select
                data-cy={CypressFields.ProductQuantity}
                onChange={event => setQuantity(+event.target.value)}
                value={quantity}
              >
                {quantityOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <S.AddToCart data-cy={CypressFields.ProductAddToCart} onClick={inSpanSnuckOntoTheEvent(onAddItem)}>
                <Image src="/icons/Cart.svg" height="15px" width="15px" alt="cart" /> Add To Cart
              </S.AddToCart>
            </S.Details>
          </S.Container>
          <Recommendations />
        </S.ProductDetail>
        <Ad />
        <Footer />
      </Layout>
    </AdProvider>
  );
};

export default ProductDetail;
