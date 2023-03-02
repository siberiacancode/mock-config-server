export type StaticPathObject = { prefix: `/${string}`; path: `/${string}` };
export type StaticPath = `/${string}` | StaticPathObject | (StaticPathObject | `/${string}`)[];

export type CorsHeader = string;
export type CorsOrigin = string | RegExp | (RegExp | string)[];
export type Cors = {
  origin: CorsOrigin | ((request: import('express').Request) => Promise<CorsOrigin> | CorsOrigin);
  methods?: Uppercase<import('./configs').RestMethod>[];
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
    configs: import('./configs').RestRequestConfig[];
  };
  graphql?: {
    baseUrl?: BaseUrl;
    configs: import('./configs').GraphQLRequestConfig[];
  };
  port?: Port;
  staticPath?: StaticPath;
  interceptors?: import('./interceptors').Interceptors;
  cors?: Cors;
}
