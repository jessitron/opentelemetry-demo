// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

/** @type {import('next').NextConfig} */

const dotEnv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const { resolve } = require('path');

const myEnv = dotEnv.config({
  path: resolve(__dirname, '../../.env'),
});
dotenvExpand.expand(myEnv);

const {
  AD_SERVICE_ADDR = 'oops, missing service address env var',
  CART_SERVICE_ADDR = 'oops, missing service address env var',
  CHECKOUT_SERVICE_ADDR = 'oops, missing service address env var',
  CURRENCY_SERVICE_ADDR = 'oops, missing service address env var',
  PRODUCT_CATALOG_SERVICE_ADDR = 'oops, missing service address env var',
  RECOMMENDATION_SERVICE_ADDR = 'oops, missing service address env var',
  SHIPPING_SERVICE_ADDR = 'oops, missing service address env var',
  ENV_PLATFORM = 'oops, missing service address env var',
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = 'oops, missing service address env var',
  OTEL_SERVICE_NAME = 'frontend',
  PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '',
} = process.env;

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.http2 = false;
      config.resolve.fallback.tls = false;
      config.resolve.fallback.net = false;
      config.resolve.fallback.dns = false;
      config.resolve.fallback.fs = false;
    }

    return config;
  },
  env: {
    AD_SERVICE_ADDR,
    CART_SERVICE_ADDR,
    CHECKOUT_SERVICE_ADDR,
    CURRENCY_SERVICE_ADDR,
    PRODUCT_CATALOG_SERVICE_ADDR,
    RECOMMENDATION_SERVICE_ADDR,
    SHIPPING_SERVICE_ADDR,
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    NEXT_PUBLIC_PLATFORM: ENV_PLATFORM,
    NEXT_PUBLIC_OTEL_SERVICE_NAME: OTEL_SERVICE_NAME,
    NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
  },
  images: {
    loader: "custom",
    loaderFile: "./utils/imageLoader.js"
  }
};

module.exports = nextConfig;
