import type { GraphQLEntityName, GraphQLOperationName, GraphQLOperationType } from './graphql';
import type { RestEntityName, RestMethod } from './rest';
import type { ApiType } from './shared';
import type { Cookies, Headers, Params, PlainObject, Query } from './values';

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

export type LoggerType = 'request' | 'response';

export type LoggerTokenValues<
  Type extends LoggerType = LoggerType,
  Api extends ApiType = ApiType
> = Type extends 'request'
  ? Api extends 'rest'
    ? LoggerRestRequestTokenValues
    : Api extends 'graphql'
      ? LoggerGraphQLRequestTokenValues
      : never
  : Type extends 'response'
    ? Api extends 'rest'
      ? LoggerRestResponseTokenValues
      : Api extends 'graphql'
        ? LoggerGraphQLResponseTokenValues
        : never
    : never;

export type MappedEntityName = Exclude<RestEntityName | GraphQLEntityName, 'body' | 'variables'>;

type LoggerTokenValuesToTokenOptions<Type> = {
  [Key in keyof Type]?: Key extends MappedEntityName ? Record<string, boolean> | boolean : boolean;
};

export type LoggerTokenOptions<
  Type extends LoggerType = LoggerType,
  Api extends ApiType = ApiType
> = LoggerTokenValuesToTokenOptions<LoggerTokenValues<Type, Api>>;

export interface Logger<Type extends LoggerType = LoggerType, Api extends ApiType = ApiType> {
  tokenOptions?: LoggerTokenOptions<Type, Api>;
  rewrite?: (tokenValues: Partial<LoggerTokenValues<Type, Api>>) => void;
}
