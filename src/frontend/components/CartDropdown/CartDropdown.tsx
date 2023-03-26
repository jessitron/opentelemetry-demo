// Copyright The OpenTelemetry Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CypressFields } from '../../utils/Cypress';
import { IProductCartItem } from '../../types/Cart';
import ProductPrice from '../ProductPrice';
import * as S from './CartDropdown.styled';
import { trace } from '@opentelemetry/api';

interface IProps {
  isOpen: boolean;
  onClose(): void;
  productList: IProductCartItem[];
}

function doSomeOtherBananaThings(bc: number) {
  trace.getTracer('custom bananas').startActiveSpan('after a timeout', s => {
    console.log('BANANAS 2');
    s.setAttribute('app.moreBananaCount', bc);
    s.end();
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

  const bananas = (event: any) => {
    trace.getTracer('custom bananas').startActiveSpan('incrementing banana count', s => {
      console.log('BANANAS');
      s.setAttribute('app.prevBananaCount', bananaCount);
      setBananaCount(bananaCount + 1);
      setTimeout(() => doSomeOtherBananaThings(bananaCount), 10);
      s.setAttribute('event.type', event.type);
      s.end();
    });
  };

  useEffect(() => {
    trace.getTracer('second custom banana').startActiveSpan('noticed banana', s => {
      console.log('BANANA COUNTED ' + bananaCount);
      s.setAttribute('app.bananaCount', bananaCount);
      setTimeout(() => doSomeOtherBananaThings(bananaCount), 10);
      s.end();
    });
  }, [bananaCount]);

  return isOpen ? (
    <S.CartDropdown ref={ref} data-cy={CypressFields.CartDropdown}>
      <div>
        <S.Header>
          <S.Title>Shopping Cart</S.Title>
          <span onClick={onClose}>Close</span>
          <span onClick={bananas}>Try Something</span>
        </S.Header>
        <S.ItemList>
          {!productList.length && <S.EmptyCart>Your shopping cart is empty</S.EmptyCart>}
          {productList.map(
            ({ quantity, product: { name, picture, id, priceUsd = { nanos: 0, currencyCode: 'USD', units: 0 } } }) => (
              <S.Item key={id} data-cy={CypressFields.CartDropdownItem}>
                <S.ItemImage src={picture} alt={name} />
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
