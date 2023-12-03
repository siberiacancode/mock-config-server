import type { Request, Response } from 'express';

import type { GraphQLOperationName, GraphQLOperationType, GraphQLVariables } from './graphql';
import type { RestMethod } from './rest';
import type { Cookies, Headers, Params, Query } from './values';

type LoggerAPI = 'rest' | 'graphql';

export interface RequestLoggerMetaTokenFlags<API extends LoggerAPI = LoggerAPI> {
  url?: boolean;
  method?: boolean;
  graphQLOperationType?: API extends 'graphql' ? boolean : never;
  graphQLOperationName?: API extends 'graphql' ? boolean : never;
  id?: boolean;
  unixTimestamp?: boolean;
}

export interface RequestLoggerEntitiesTokenFlags<API extends LoggerAPI = LoggerAPI> {
  headers?: boolean;
  cookies?: any;
  query?: boolean;
  params?: boolean;
  variables?: API extends 'graphql' ? boolean : never;
  body?: boolean;
}

export interface RequestLoggerTokenFlags<API extends LoggerAPI = LoggerAPI> {
  meta?: RequestLoggerMetaTokenFlags<API>;
  entities?: RequestLoggerEntitiesTokenFlags<API>;
}

export interface RequestLogFunctionParams<API extends LoggerAPI = LoggerAPI> {
  logger: RequestLogger;
  tokenValues: {
    meta: {
      url: string;
      method: RestMethod;
      graphQLOperationType: API extends 'graphql' ? GraphQLOperationType | undefined : never;
      graphQLOperationName: API extends 'graphql' ? GraphQLOperationName | undefined : never;
      id: number | undefined;
      unixTimestamp: number;
    };
    entities: {
      headers: Headers;
      cookies: Cookies;
      query: Query;
      params: Params;
      variables: API extends 'graphql' ? GraphQLVariables | undefined : never;
      body: any;
    };
  };
  request: Request;
  defaultLogFunction: RequestLogFunction;
}

export type RequestLogFunction<API extends LoggerAPI = LoggerAPI> = (
  params: RequestLogFunctionParams<API>
) => void | Promise<void>;

export interface RequestLogger<API extends LoggerAPI = LoggerAPI> {
  enabled: boolean;
  logFunction?: RequestLogFunction<API>;
  tokens?: RequestLoggerTokenFlags<API>;
}

export interface ResponseLoggerMetaTokenFlags<API extends LoggerAPI = LoggerAPI> {
  url?: boolean;
  method?: boolean;
  graphQLOperationType?: API extends 'graphql' ? boolean : string;
  graphQLOperationName?: API extends 'graphql' ? boolean : never;
  statusCode?: boolean;
  id?: boolean;
  unixTimestamp?: boolean;
}

export interface ResponseLoggerEntitiesTokenFlags<API extends LoggerAPI = LoggerAPI> {
  headers?: boolean;
  cookies?: any;
  query?: boolean;
  params?: boolean;
  variables?: API extends 'graphql' ? boolean : never;
  body?: boolean;
}

export interface ResponseLoggerTokenFlags<API extends LoggerAPI = LoggerAPI> {
  meta: ResponseLoggerMetaTokenFlags<API>;
  entities?: ResponseLoggerEntitiesTokenFlags<API>;
  data?: boolean;
}

export interface ResponseLogFunctionParams<API extends LoggerAPI = LoggerAPI> {
  logger: ResponseLogger;
  tokenValues: {
    meta: {
      url: string;
      method: RestMethod;
      graphQLOperationType: API extends 'graphql' ? GraphQLOperationType | undefined : never;
      graphQLOperationName: API extends 'graphql' ? GraphQLOperationName | undefined : never;
      statusCode: number;
      id: number | undefined;
      unixTimestamp: number;
    };
    entities: {
      headers: Headers;
      cookies: Cookies;
      query: Query;
      params: Params;
      variables: API extends 'graphql' ? GraphQLVariables | undefined : never;
      body: any;
    };
    data: any;
  };
  request: Request;
  response: Response;
  defaultLogFunction: ResponseLogFunction;
}

export type ResponseLogFunction<API extends LoggerAPI = LoggerAPI> = (
  params: ResponseLogFunctionParams<API>
) => void | Promise<void>;

export interface ResponseLogger<API extends LoggerAPI = LoggerAPI> {
  enabled: boolean;
  logFunction?: ResponseLogFunction<API>;
  tokens?: ResponseLoggerTokenFlags<API>;
}

export interface Loggers<API extends LoggerAPI = LoggerAPI> {
  request?: RequestLogger<API>;
  response?: ResponseLogger<API>;
}
