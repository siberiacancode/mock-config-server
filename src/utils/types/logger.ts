import type { GraphQLEntityName, GraphQLOperationName, GraphQLOperationType } from './graphql';
import type { RestEntityName, RestMethod } from './rest';
import type { Cookies, Headers, Params, PlainObject, Query } from './values';

export type MappedEntityName = Exclude<RestEntityName | GraphQLEntityName, 'body' | 'variables'>;

type LoggerValuesToFlags<Type> = {
  [Key in keyof Type]?: Key extends MappedEntityName ? Record<string, boolean> | boolean : boolean;
};

export type LoggerType = 'request' | 'response';

export type LoggerAPI = 'rest' | 'graphql';

export interface LoggerBaseTokenValues {
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

interface LoggerRestRequestTokenValues extends LoggerBaseTokenValues {}

interface LoggerRestResponseTokenValues extends LoggerRestRequestTokenValues {
  statusCode: number;
  data: any;
}

interface LoggerGraphQLRequestTokenValues extends LoggerBaseTokenValues {
  graphQLOperationType?: GraphQLOperationType;
  graphQLOperationName?: GraphQLOperationName;
  variables?: PlainObject | undefined;
}

interface LoggerGraphQLResponseTokenValues extends LoggerGraphQLRequestTokenValues {
  statusCode: number;
  data: any;
}

export type LoggerTokenValues<
  Type extends LoggerType = LoggerType,
  API extends LoggerAPI = LoggerAPI
> = Type extends 'request'
  ? API extends 'rest'
    ? LoggerRestRequestTokenValues
    : API extends 'graphql'
      ? LoggerGraphQLRequestTokenValues
      : never
  : Type extends 'response'
    ? API extends 'rest'
      ? LoggerRestResponseTokenValues
      : API extends 'graphql'
        ? LoggerGraphQLResponseTokenValues
        : never
    : never;

type LoggerRestRequestTokenFlags = LoggerValuesToFlags<LoggerRestRequestTokenValues>;
type LoggerRestResponseTokenFlags = LoggerValuesToFlags<LoggerRestResponseTokenValues>;
type LoggerGraphQLRequestTokenFlags = LoggerValuesToFlags<LoggerGraphQLRequestTokenValues>;
type LoggerGraphQLResponseTokenFlags = LoggerValuesToFlags<LoggerGraphQLResponseTokenValues>;

export type LoggerTokenFlags<
  Type extends LoggerType = LoggerType,
  API extends LoggerAPI = LoggerAPI
> = Type extends 'request'
  ? API extends 'rest'
    ? LoggerRestRequestTokenFlags
    : API extends 'graphql'
      ? LoggerGraphQLRequestTokenFlags
      : never
  : Type extends 'response'
    ? API extends 'rest'
      ? LoggerRestResponseTokenFlags
      : API extends 'graphql'
        ? LoggerGraphQLResponseTokenFlags
        : never
    : never;

export interface Logger<Type extends LoggerType = LoggerType, API extends LoggerAPI = LoggerAPI> {
  enabled?: boolean;
  tokenFlags?: LoggerTokenFlags<Type, API>;
  rewrite?: (tokenValues: Partial<LoggerTokenValues<Type, API>>) => void;
}

export interface Loggers<API extends LoggerAPI = LoggerAPI> {
  request?: Logger<'request', API>;
  response?: Logger<'response', API>;
}
