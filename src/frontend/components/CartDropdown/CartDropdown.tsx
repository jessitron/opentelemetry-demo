// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import Link from 'next/link';
import { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { CypressFields } from '../../utils/Cypress';
import { IProductCartItem } from '../../types/Cart';
import ProductPrice from '../ProductPrice';
import * as S from './CartDropdown.styled';
import { trace, context, Span } from '@opentelemetry/api';

interface IProps {
  isOpen: boolean;
  onClose(): void;
  productList: IProductCartItem[];
}

const tracer = trace.getTracer('custom bananas');

function doSomeOtherBananaThings(bc: number, desc: string) {
  tracer.startActiveSpan('some other banana things', s => {
    s.setAttribute('app.description', desc);
    s.setAttribute('app.moreBananaCount', bc);
    const result = Promise.resolve(
      trace.getTracer('custom bananas').startActiveSpan('promised banana things', s => {
        s.setAttribute('app.description', desc);
        s.setAttribute('app.moreBananaCount', bc);
        s.end();
      })
    );
    s.end();
    return result;
  });
}

const CartDropdown = ({ productList, isOpen, onClose }: IProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [bananaCount, setBananaCount] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  type OnClickHandler = MouseEventHandler<HTMLSpanElement>; // something
  function inSpanSnuckOntoTheEvent(f: OnClickHandler): OnClickHandler {
    return event => {
      const sneakySpan = event.target['active_span'] as Span;
      console.log('Looking for a sneaky span. Did I find one? ', sneakySpan);
      if (!sneakySpan) {
        return f(event);
      }
      context.with(trace.setSpan(context.active(), sneakySpan), () => f(event));
    };
  }

  /* eslint-disable */
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const bananas = (event: any) => {
    return tracer.startActiveSpan('incrementing banana count', async s => {
      console.log("event.target['active_span'] ", event.target['active_span'], event.target);
      s.setAttribute('app.prevBananaCount', bananaCount);
      setBananaCount(bananaCount + 1);
      doSomeOtherBananaThings(bananaCount, 'not-awaiting, just calling');
      s.setAttribute('event.type', event.type);
      s.end();
    });
  };

  useEffect(() => {
    tracer.startActiveSpan('noticed banana', s => {
      s.setAttribute('app.bananaCount', bananaCount);
      setTimeout(() => doSomeOtherBananaThings(bananaCount, '10 ms later'), 10);
      s.end();
    });
  }, [bananaCount]);

  return isOpen ? (
    <S.CartDropdown ref={ref} data-cy={CypressFields.CartDropdown}>
      <div>
        <S.Header>
          <S.Title>Shopping Cart</S.Title>
          <span onClick={onClose}>Close</span>
          <span onClick={inSpanSnuckOntoTheEvent(bananas)}>Try Something</span>
        </S.Header>
        <S.ItemList>
          {!productList.length && <S.EmptyCart>Your shopping cart is empty</S.EmptyCart>}
          {productList.map(
            ({ quantity, product: { name, picture, id, priceUsd = { nanos: 0, currencyCode: 'USD', units: 0 } } }) => (
              <S.Item key={id} data-cy={CypressFields.CartDropdownItem}>
                <S.ItemImage src={"/images/products/" + picture} alt={name} />
                <S.ItemDetails>
                  <S.ItemName>{name}</S.ItemName>
                  <ProductPrice price={priceUsd} />
                  <S.ItemQuantity>Quantity: {quantity}</S.ItemQuantity>
                </S.ItemDetails>
              </S.Item>
            )
          )}
        </S.ItemList>
      </div>
      <Link href="/cart">
        <S.CartButton data-cy={CypressFields.CartGoToShopping}>Go to Shopping Cart</S.CartButton>
      </Link>
    </S.CartDropdown>
  ) : null;
};

export default CartDropdown;
