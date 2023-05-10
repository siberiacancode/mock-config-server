import type { Request } from 'express';

import type { GraphQLRequestConfig } from './graphql';
import type { Interceptors } from './interceptors';
import type { RestMethod, RestRequestConfig } from './rest';

export type StaticPathObject = { prefix: `/${string}`; path: `/${string}` };
export type StaticPath = `/${string}` | StaticPathObject | (StaticPathObject | `/${string}`)[];

export type CorsHeader = string;
export type CorsOrigin = string | RegExp | (RegExp | string)[];
export type Cors = {
  origin: CorsOrigin | ((request: Request) => Promise<CorsOrigin> | CorsOrigin);
  methods?: Uppercase<RestMethod>[];
  allowedHeaders?: CorsHeader[];
  exposedHeaders?: CorsHeader[];
  credentials?: boolean;
  maxAge?: number;
};

export type Port = number;
export type BaseUrl = `/${string}`;

export interface MockServerConfig {
  baseUrl?: BaseUrl;
  rest?: {
    baseUrl?: BaseUrl;
    configs: RestRequestConfig[];
  };
  graphql?: {
    baseUrl?: BaseUrl;
    configs: GraphQLRequestConfig[];
  };
  port?: Port;
  staticPath?: StaticPath;
  interceptors?: Interceptors;
  cors?: Cors;
}

export type MockServerConfigArgv = Partial<
  Pick<MockServerConfig, 'baseUrl' | 'port' | 'staticPath'> & { config: string, noWatch: boolean }
>;
