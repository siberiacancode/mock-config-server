import type { Request, Response } from 'express';

import type { GraphQLOperationName, GraphQLOperationType } from './graphql';
import type { RestMethod } from './rest';
import type { DeepPartial } from './utils';
import type { Cookies, Headers, Params, PlainObject, Query } from './values';

type LoggerType = 'request' | 'response';

type LoggerAPI = 'rest' | 'graphql';

export interface LoggerTokenFlags<
  Type extends LoggerType = LoggerType,
  API extends LoggerAPI = LoggerAPI
> {
  meta?: {
    unixTimestamp?: boolean;
    id?: boolean;
    method?: boolean;
    graphQLOperationType?: API extends 'graphql' ? boolean : never;
    graphQLOperationName?: API extends 'graphql' ? boolean : never;
    url?: boolean;
    statusCode?: Type extends 'response' ? boolean : never;
  };
  entities?: {
    headers?: boolean;
    cookies?: any;
    query?: boolean;
    params?: boolean;
    variables?: API extends 'graphql' ? boolean : never;
    body?: boolean;
  };
  data?: Type extends 'response' ? boolean : never;
}

export interface LoggerTokenValues<
  Type extends LoggerType = LoggerType,
  API extends LoggerAPI = LoggerAPI
> {
  type: Type;
  meta: {
    unixTimestamp: number;
    id: number | undefined;
    method: RestMethod;
    graphQLOperationType: API extends 'graphql' ? GraphQLOperationType | undefined : never;
    graphQLOperationName: API extends 'graphql' ? GraphQLOperationName | undefined : never;
    url: string;
    statusCode?: Type extends 'response' ? number : never;
  };
  entities: {
    headers: Headers;
    cookies: Cookies;
    query: Query;
    params: Params;
    variables: API extends 'graphql' ? PlainObject | undefined : never;
    body: any;
  };
  data?: Type extends 'response' ? any : never;
}

export interface LoggerParams<
  Type extends LoggerType = LoggerType,
  API extends LoggerAPI = LoggerAPI
> {
  logger: Logger<Type, API>;
  tokenValues: LoggerTokenValues<Type, API>;
  request: Request;
  response?: Type extends 'response' ? Response : never;
  getTokens: GetTokens<Type, API>;
}

export type GetTokens<Type extends LoggerType = LoggerType, API extends LoggerAPI = LoggerAPI> = (
  params: LoggerParams<Type, API>
) => DeepPartial<LoggerTokenValues<Type, API>> & PlainObject;

export type LogFunction<Type extends LoggerType = LoggerType, API extends LoggerAPI = LoggerAPI> = (
  params: LoggerParams<Type, API>
) => void | Promise<void>;

export interface Logger<Type extends LoggerType = LoggerType, API extends LoggerAPI = LoggerAPI> {
  enabled: boolean;
  logFunction?: LogFunction<Type, API>;
  tokens?: LoggerTokenFlags<Type, API>;
}

export interface Loggers<API extends LoggerAPI = LoggerAPI> {
  request?: Logger<'request', API>;
  response?: Logger<'response', API>;
}
