export type StaticPathObject = { prefix: string; path: string };
export type StaticPath = string | StaticPathObject | (StaticPathObject | string)[];

export type CorsHeader = string;
export type CorsOrigin = string | RegExp | (RegExp | string)[];
export type Cors = {
  origin: CorsOrigin | (() => Promise<CorsOrigin> | CorsOrigin);
  methods?: Uppercase<import('./configs').RestMethod>[];
  headers?: CorsHeader[];
  credentials?: boolean;
  maxAge?: number;
};

export type Port = number;
export type BaseUrl = string;

export interface MockServerConfig {
  configs: import('./configs').RequestConfig[];
  baseUrl?: BaseUrl;
  port?: Port;
  staticPath?: StaticPath;
  interceptors?: import('./interceptors').Interceptors;
  cors?: Cors;
}
