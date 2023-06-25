import type { Request } from 'express';

import type { Interceptors } from './interceptors';
import type { CheckFunction, CheckMode, CheckActualValueCheckMode, CompareWithExpectedValueCheckMode, Data } from './values';

export type RestMethod = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'options';
export type RestEntityName = 'headers' | 'cookies' | 'query' | 'params' | 'body';

export type RestObjectEntityKey = string;
export type RestObjectEntityValue = string | number | boolean;

export type RestPlainEntityValue =
  | string
  // ✅ important: Omit `checkMode` key for fix types. Omit `call` key for exclude functions
  | { checkMode?: undefined; call?: undefined; [key: string]: any }
  | any[];

export type RestEntityValue<EntityName = RestEntityName> =
  EntityName extends 'body'
    ? RestPlainEntityValue
    : RestObjectEntityValue;

export type RestEntityDescriptor<
  EntityName extends RestEntityName = RestEntityName,
  Check extends CheckMode = CheckMode
> =
  Check extends 'function' ?
    {
      checkMode: Check;
      value: (actualValue: any, checkFunction: CheckFunction) => boolean;
    } :
    Check extends 'regExp' ?
      {
        checkMode: Check,
        value: RegExp | RegExp[];
      } :
      Check extends CompareWithExpectedValueCheckMode ?
        {
          checkMode: Check;
          value: RestEntityValue<EntityName> | RestEntityValue<EntityName>[];
        } :
        Check extends CheckActualValueCheckMode ?
          {
            checkMode: Check;
            value?: undefined;
          } :
          never;

export type RestEntityDescriptorOrValue<EntityName extends RestEntityName = RestEntityName> =
  EntityName extends 'body'
    ? RestEntityDescriptor<EntityName> | RestEntityValue<EntityName>
    : Record<RestObjectEntityKey, RestEntityDescriptor<EntityName> | RestEntityValue<EntityName> | RestEntityValue<EntityName>[]>;

export type RestEntityDescriptorOnly<EntityName extends RestEntityName = RestEntityName> =
  EntityName extends 'body'
    ? RestEntityDescriptor<EntityName>
    : Record<RestObjectEntityKey, RestEntityDescriptor<EntityName>>;

export interface RestEntityNamesByMethod {
  get: Exclude<RestEntityName, 'body'>;
  delete: Exclude<RestEntityName, 'body'>;
  post: RestEntityName;
  put: RestEntityName;
  patch: RestEntityName;
  options: Exclude<RestEntityName, 'body'>;
}

export type RestEntityByEntityName<Method extends RestMethod> = {
  [EntityName in RestEntityNamesByMethod[Method]]?: RestEntityDescriptorOrValue<EntityName>
};

export interface RestRouteConfig<
  Method extends RestMethod,
  Entities extends RestEntityByEntityName<Method> = RestEntityByEntityName<Method>
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
