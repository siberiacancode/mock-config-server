import type { Request } from 'express';

import type { GraphQLRequestConfig } from './graphql';
import type { Interceptors } from './interceptors';
import type { RestMethod, RestRequestConfig } from './rest';

type StaticPathObject = { prefix: `/${string}`; path: `/${string}` };
export type StaticPath = `/${string}` | StaticPathObject | (StaticPathObject | `/${string}`)[];

type CorsHeader = string;
export type CorsOrigin = string | RegExp | (RegExp | string)[];
export type Cors = {
  origin: CorsOrigin | ((request: Request) => Promise<CorsOrigin> | CorsOrigin);
  methods?: Uppercase<RestMethod>[];
  allowedHeaders?: CorsHeader[];
  exposedHeaders?: CorsHeader[];
  credentials?: boolean;
  maxAge?: number;
};

type Port = number;
export type BaseUrl = `/${string}`;

export interface RestConfig {
  baseUrl?: BaseUrl;
  configs: RestRequestConfig[];
  interceptors?: Interceptors;
}

export interface GraphqlConfig {
  baseUrl?: BaseUrl;
  configs: GraphQLRequestConfig[];
  interceptors?: Interceptors;
}

export type DatabaseConfig = Record<string, any>;

export interface MockServerConfig {
  baseUrl?: BaseUrl;
  rest?: RestConfig;
  graphql?: GraphqlConfig;
  database?: DatabaseConfig;
  port?: Port;
  staticPath?: StaticPath;
  interceptors?: Interceptors;
  cors?: Cors;
}

export interface MockServerConfigArgv {
  baseUrl?: string;
  port?: number;
  staticPath?: string;
  config?: string;
  watch?: boolean;
}
