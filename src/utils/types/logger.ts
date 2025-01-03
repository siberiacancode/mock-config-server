import type { GraphQLOperationName, GraphQLOperationType } from './graphql';
import type { RestMethod } from './rest';
import type { ApiType } from './shared';
import type { Cookies, Headers, Params, PlainObject, Query } from './values';

export interface LoggerBaseTokens {
  type: string;
  id: number;
  timestamp: number;
  method: RestMethod;
  url: string;
  headers: Headers;
  cookies: Cookies;
  query: Query;
  params: Params;
  body: any;
}

interface LoggerRestRequestTokens extends LoggerBaseTokens {}

interface LoggerRestResponseTokens extends LoggerRestRequestTokens {
  statusCode: number;
  data: any;
}

interface LoggerGraphQLRequestTokens extends LoggerBaseTokens {
  graphQLOperationType: GraphQLOperationType | null;
  graphQLOperationName: GraphQLOperationName | null;
  graphQLQuery: string | null;
  variables: PlainObject | null;
}

interface LoggerGraphQLResponseTokens extends LoggerGraphQLRequestTokens {
  statusCode: number;
  data: any;
}

export type LoggerType = 'request' | 'response';

export type LoggerTokens<
  Type extends LoggerType = LoggerType,
  Api extends ApiType = ApiType
> = Type extends 'request'
  ? Api extends 'rest'
    ? LoggerRestRequestTokens
    : Api extends 'graphql'
      ? LoggerGraphQLRequestTokens
      : never
  : Type extends 'response'
    ? Api extends 'rest'
      ? LoggerRestResponseTokens
      : Api extends 'graphql'
        ? LoggerGraphQLResponseTokens
        : never
    : never;

type LoggerTokensToTokenOptions<Type> = {
  [Key in keyof Type]?: Type[Key] extends PlainObject ? Record<string, boolean> | boolean : boolean;
};

export type LoggerTokenOptions<
  Type extends LoggerType = LoggerType,
  Api extends ApiType = ApiType
> = LoggerTokensToTokenOptions<LoggerTokens<Type, Api>>;

export interface Logger<Type extends LoggerType = LoggerType, Api extends ApiType = ApiType> {
  tokens?: LoggerTokenOptions<Type, Api>;
  rewrite?: (tokens: Partial<LoggerTokens<Type, Api>>) => void;
}
