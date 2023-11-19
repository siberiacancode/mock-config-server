import type { Request } from 'express';

import type { GraphQLEntityName, GraphQLRequestConfig } from './graphql';
import type { Interceptors } from './interceptors';
import type { Loggers } from './logger';
import type { RestEntityName, RestMethod, RestRequestConfig } from './rest';

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
  loggers?: Loggers<RestEntityName, RestEntityName | 'data'>;
}

export interface GraphqlConfig {
  baseUrl?: BaseUrl;
  configs: GraphQLRequestConfig[];
  interceptors?: Interceptors;
  loggers?: Loggers<GraphQLEntityName, GraphQLEntityName | 'data'>;
}

export type DatabaseConfig = {
  data: Record<string, unknown> | `${string}.json`;
  routes?: Record<`/${string}`, `/${string}`> | `${string}.json`;
};

export interface BaseMockServerConfig {
  baseUrl?: BaseUrl;
  port?: Port;
  staticPath?: StaticPath;
  interceptors?: Interceptors;
  loggers?: Loggers<
    RestEntityName | GraphQLEntityName,
    RestEntityName | GraphQLEntityName | 'data'
  >;
  cors?: Cors;
}
export interface MockServerConfig extends BaseMockServerConfig {
  rest?: RestConfig;
  graphql?: GraphqlConfig;
  database?: DatabaseConfig;
}

export interface RestMockServerConfig extends BaseMockServerConfig {
  configs: RestRequestConfig[];
  database?: DatabaseConfig;
}

export interface GraphQLMockServerConfig extends BaseMockServerConfig {
  configs: GraphQLRequestConfig[];
  database?: DatabaseConfig;
}

export interface DatabaseMockServerConfig extends BaseMockServerConfig {
  data: Record<string, unknown> | `${string}.json`;
  routes?: Record<`/${string}`, `/${string}`> | `${string}.json`;
}

export interface MockServerConfigArgv {
  baseUrl?: string;
  port?: number;
  staticPath?: string;
  config?: string;
  watch?: boolean;
}
