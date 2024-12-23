import type { GraphQLEntityName, GraphQLOperationName, GraphQLOperationType } from './graphql';
import type { RestEntityName, RestMethod } from './rest';
import type { Cookies, Headers, Params, PlainObject, Query } from './values';

export type MappedEntityName = Exclude<RestEntityName | GraphQLEntityName, 'body' | 'variables'>;

type LoggerTokenValuesToTokenOptions<Type> = {
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
  graphQLOperationType: GraphQLOperationType | null;
  graphQLOperationName: GraphQLOperationName | null;
  variables: PlainObject | null;
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

type LoggerRestRequestTokenOptions = LoggerTokenValuesToTokenOptions<LoggerRestRequestTokenValues>;
type LoggerRestResponseTokenOptions =
  LoggerTokenValuesToTokenOptions<LoggerRestResponseTokenValues>;
type LoggerGraphQLRequestTokenOptions =
  LoggerTokenValuesToTokenOptions<LoggerGraphQLRequestTokenValues>;
type LoggerGraphQLResponseTokenOptions =
  LoggerTokenValuesToTokenOptions<LoggerGraphQLResponseTokenValues>;

export type LoggerTokenOptions<
  Type extends LoggerType = LoggerType,
  API extends LoggerAPI = LoggerAPI
> = Type extends 'request'
  ? API extends 'rest'
    ? LoggerRestRequestTokenOptions
    : API extends 'graphql'
      ? LoggerGraphQLRequestTokenOptions
      : never
  : Type extends 'response'
    ? API extends 'rest'
      ? LoggerRestResponseTokenOptions
      : API extends 'graphql'
        ? LoggerGraphQLResponseTokenOptions
        : never
    : never;

export interface Logger<Type extends LoggerType = LoggerType, API extends LoggerAPI = LoggerAPI> {
  tokenOptions?: LoggerTokenOptions<Type, API>;
  rewrite?: (tokenValues: Partial<LoggerTokenValues<Type, API>>) => void;
}
