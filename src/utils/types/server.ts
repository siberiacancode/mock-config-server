import type { Request } from 'express';
import type { Arguments } from 'yargs';

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

export type DatabaseConfig = {
  data: Record<string, unknown> | `${string}.json`;
  routes?: Record<`/${string}`, `/${string}`> | `${string}.json`;
};

export interface BaseMockServerConfig {
  baseUrl?: BaseUrl;
  port?: Port;
  staticPath?: StaticPath;
  interceptors?: Interceptors;
  cors?: Cors;
}

export interface MockServerConfig extends BaseMockServerConfig {
  rest?: RestConfig;
  graphql?: GraphqlConfig;
  database?: DatabaseConfig;
}

export interface RestMockServerConfig extends BaseMockServerConfig {
  configs?: RestRequestConfig[];
  database?: DatabaseConfig;
}

export interface GraphQLMockServerConfig extends BaseMockServerConfig {
  configs?: GraphQLRequestConfig[];
  database?: DatabaseConfig;
}

export interface DatabaseMockServerConfig extends BaseMockServerConfig {
  data: Record<string, unknown> | `${string}.json`;
  routes?: Record<`/${string}`, `/${string}`> | `${string}.json`;
}

export type MockServerConfigArgv = Arguments<{
  baseUrl?: string;
  port?: number;
  staticPath?: string;
  config?: string;
  watch?: boolean;
}>;

export type FlatMockServerComponent = {
  name?: string;
  configs: Array<RestRequestConfig | GraphQLRequestConfig>;
  baseUrl?: BaseUrl;
  interceptors?: Interceptors;
  database?: DatabaseConfig;
};

export type FlatMockServerSettings = {
  baseUrl?: BaseUrl;
  port?: Port;
  staticPath?: StaticPath;
  interceptors?: Interceptors;
  cors?: Cors;
};

export type FlatMockServerConfig = [
  option: FlatMockServerSettings | FlatMockServerComponent,
  ...flatMockServerConfigs: FlatMockServerComponent[]
];
