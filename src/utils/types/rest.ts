import type { Request } from 'express';

import type { Interceptors } from './interceptors';
import type { CheckFunction, CheckMode, CheckOneValueMode, CheckTwoValuesMode, Data } from './values';

export type RestMethod = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'options';
export type RestEntityName = 'headers' | 'cookies' | 'query' | 'params' | 'body';

export type RestEntityValue<EntityName = RestEntityName> =
  EntityName extends 'headers'
    ? string | number
    : EntityName extends 'cookies'
      ? string | number
      : EntityName extends 'query'
        ? string | number
        : EntityName extends 'params'
          ? string | number
          : EntityName extends 'body'
            ? any
            : never;

export type RestEntityDescriptor<
  EntityName extends RestEntityName = RestEntityName,
  Check extends CheckMode = CheckMode
> =
  Check extends 'function' ?
    {
      checkMode: Check;
      value: (actualValue: RestEntityValue<EntityName>, checkValues: CheckFunction) => boolean;
    } :
    Check extends 'regExp' ?
      {
        checkMode: Check,
        value: RegExp | RegExp[];
      } :
      Check extends CheckTwoValuesMode ?
        {
          checkMode: Check;
          value: RestEntityValue<EntityName> | RestEntityValue<EntityName>[];
        } :
        Check extends CheckOneValueMode ?
          {
            checkMode: Check;
            value?: undefined;
          } :
          never

export type RestHeaderOrCookieOrQueryOrParamsName = string;

export type RestHeadersEntity = Record<RestHeaderOrCookieOrQueryOrParamsName, RestEntityDescriptor<'headers'>>;
export type RestCookiesEntity = Record<RestHeaderOrCookieOrQueryOrParamsName, RestEntityDescriptor<'cookies'>>;
export type RestQueryEntity = Record<RestHeaderOrCookieOrQueryOrParamsName, RestEntityDescriptor<'query'>>;
export type RestParamsEntity = Record<RestHeaderOrCookieOrQueryOrParamsName, RestEntityDescriptor<'params'>>;
export type RestBodyEntity = RestEntityDescriptor<'body'>;

export type RestEntity<EntityName = RestEntityName> =
  EntityName extends 'headers'
    ? RestHeadersEntity
    : EntityName extends 'cookies'
      ? RestCookiesEntity
      : EntityName extends 'query'
        ? RestQueryEntity
        : EntityName extends 'params'
          ? RestParamsEntity
          : EntityName extends 'body'
            ? RestBodyEntity
            : never;

export type RestEntityByName = {
  [EntityName in RestEntityName]: RestEntity<EntityName>
};

export type RestEntityNameByMethod<Methods extends RestMethod = RestMethod> = {
  [Method in Methods]: Method extends Extract<RestMethod, 'get' | 'delete' | 'options'>
    ? Exclude<RestEntityName, 'body'>
    : RestEntityName;
};

export type RestRouteConfigEntities<Method extends RestMethod> = {
  [EntityName in RestEntityNameByMethod[Method]]?: RestEntityByName[EntityName];
};

export interface RestRouteConfig<
  Method extends RestMethod,
  Entities extends RestRouteConfigEntities<Method> = RestRouteConfigEntities<Method>
> {
  entities?: Entities;
  data: ((request: Request, entities: Entities) => Data | Promise<Data>) | Data;
  interceptors?: Pick<Interceptors, 'response'>;
}

export interface BaseRestRequestConfig<Method extends RestMethod> {
  path: `/${string}` | RegExp;
  method: Method;
  routes: RestRouteConfig<Method>[];
  interceptors?: Interceptors;
}

export type RestGetRequestConfig = BaseRestRequestConfig<'get'>;
export type RestPostRequestConfig = BaseRestRequestConfig<'post'>;
export type RestPutRequestConfig = BaseRestRequestConfig<'put'>;
export type RestDeleteRequestConfig = BaseRestRequestConfig<'delete'>;
export type RestPatchRequestConfig = BaseRestRequestConfig<'patch'>;
export type RestOptionsRequestConfig = BaseRestRequestConfig<'options'>;
export type RestRequestConfig =
  | RestGetRequestConfig
  | RestPostRequestConfig
  | RestPutRequestConfig
  | RestDeleteRequestConfig
  | RestPatchRequestConfig
  | RestOptionsRequestConfig;
