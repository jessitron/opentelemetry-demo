// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import type { NextApiRequest, NextApiResponse } from 'next';
import InstrumentationMiddleware from '../../../../utils/telemetry/InstrumentationMiddleware';
import { Empty, Product } from '../../../../protos/demo';
import ProductCatalogService from '../../../../services/ProductCatalog.service';
import { trace } from '@opentelemetry/api';

type TResponse = Product | Empty;

const handler = async ({ method, query }: NextApiRequest, res: NextApiResponse<TResponse>) => {
  switch (method) {
    case 'GET': {
      const { productId = '', currencyCode = '' } = query;

      const product = await ProductCatalogService.getProduct(productId as string, currencyCode as string);

      let randomDelay = Math.floor(Math.random() * 2000);
      if (typeof currencyCode === "string" && currencyCode.startsWith('U')) {
        randomDelay = 0;
      }
      console.log("Let us be slow in the backend" + randomDelay + "ms")
      trace.getActiveSpan().setAttributes({ 'jess.delay': randomDelay, 'jess.currencyCode': currencyCode });
      await sleep(randomDelay);
      return res.status(200).json(product);
    }

    default: {
      return res.status(405).send('');
    }
  }
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default InstrumentationMiddleware(handler);
