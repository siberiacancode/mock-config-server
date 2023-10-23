import type { Request } from 'express';

import type {
  CalculateByDescriptorValueCheckMode,
  CheckActualValueCheckMode,
  CheckFunction,
  CheckMode,
  CompareWithDescriptorAnyValueCheckMode,
  CompareWithDescriptorValueCheckMode
} from './checkModes';
import type { Interceptors } from './interceptors';
import type { Data, Primitive } from './values';

export type RestMethod = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'options';

export type RestEntityName = 'headers' | 'cookies' | 'query' | 'params' | 'body';

export type RestMappedEntityKey = string;
type RestMappedEntityValue = string | number | boolean;

export interface RestSettings {
  readonly polling?: boolean;
}

type RestPlainEntityInnerValue = {
  checkMode?: undefined;
  call?: undefined;
  dotAll?: undefined;
  [key: string]: Primitive | RestPlainEntityInnerValue;
};

type RestPlainEntityValue =
  // ✅ important:
  // Omit `checkMode` key for fix types,
  // Omit `call` key for exclude functions,
  // Omit `dotAll` for exclude RegExp.
  | {
      checkMode?: undefined;
      call?: undefined;
      dotAll?: undefined;
      [key: string]: RestPlainEntityInnerValue | Primitive | RestEntityDescriptor;
    }
  | (RestPlainEntityInnerValue | Primitive | RestEntityDescriptor)[];

type RestEntityValue<EntityName = RestEntityName> = EntityName extends 'body'
  ? RestPlainEntityValue
  : RestMappedEntityValue;

type RestEntityValueOrValues<EntityName = RestEntityName> =
  | RestEntityValue<EntityName>
  | RestEntityValue<EntityName>[];

type RestEntityDescriptor<
  EntityName extends RestEntityName = RestEntityName,
  Check extends CheckMode = CheckMode
> = EntityName extends 'body'
  ? Check extends Extract<CalculateByDescriptorValueCheckMode, 'function'>
    ? {
        checkMode: Check;
        value: (actualValue: any, checkFunction: CheckFunction) => boolean;
      }
    : Check extends CompareWithDescriptorAnyValueCheckMode
    ? {
        checkMode: Check;
        value: RestEntityValueOrValues<EntityName>;
      }
    : Check extends CheckActualValueCheckMode
    ? {
        checkMode: Check;
        value?: undefined;
      }
    : never
  : Check extends Extract<CalculateByDescriptorValueCheckMode, 'function'>
  ? {
      checkMode: Check;
      value: (actualValue: any, checkFunction: CheckFunction) => boolean;
    }
  : Check extends Extract<CalculateByDescriptorValueCheckMode, 'regExp'>
  ? {
      checkMode: Check;
      value: RegExp | RegExp[];
    }
  : Check extends CompareWithDescriptorValueCheckMode
  ? {
      checkMode: Check;
      value: RestEntityValueOrValues<EntityName>;
    }
  : Check extends CheckActualValueCheckMode
  ? {
      checkMode: Check;
      value?: undefined;
    }
  : never;

export type RestEntityDescriptorOrValue<EntityName extends RestEntityName = RestEntityName> =
  EntityName extends 'body'
    ? RestEntityDescriptor<EntityName> | RestEntityValue<EntityName>
    : Record<
        RestMappedEntityKey,
        RestEntityDescriptor<EntityName> | RestEntityValueOrValues<EntityName>
      >;

export type RestEntityDescriptorOnly<EntityName extends RestEntityName = RestEntityName> =
  EntityName extends 'body'
    ? RestEntityDescriptor<EntityName>
    : Record<RestMappedEntityKey, RestEntityDescriptor<EntityName>>;

export interface RestEntityNamesByMethod {
  get: Exclude<RestEntityName, 'body'>;
  delete: Exclude<RestEntityName, 'body'>;
  post: RestEntityName;
  put: RestEntityName;
  patch: RestEntityName;
  options: Exclude<RestEntityName, 'body'>;
}

export type RestEntityByEntityName<Method extends RestMethod> = {
  [EntityName in RestEntityNamesByMethod[Method]]?: RestEntityDescriptorOrValue<EntityName>;
};

export type RestRouteConfig<
  Method extends RestMethod,
  Entities extends RestEntityByEntityName<Method> = RestEntityByEntityName<Method>,
  Settings extends RestSettings = RestSettings
> = (
  | {
      settings: Settings & { polling: true };
      queue: Array<{
        time?: number;
        data: ((request: Request, entities: Entities) => Data | Promise<Data>) | Data;
      }>;
    }
  | {
      settings?: Settings & { polling?: false };
      data: ((request: Request, entities: Entities) => Data | Promise<Data>) | Data;
    }
) & { entities?: Entities; interceptors?: Pick<Interceptors, 'response'> };

export type RestPathString = `/${string}`;
export interface BaseRestRequestConfig<Method extends RestMethod> {
  path: RestPathString | RegExp;
  method: Method;
  routes: RestRouteConfig<Method>[];
  interceptors?: Interceptors;
}

type RestGetRequestConfig = BaseRestRequestConfig<'get'>;
type RestPostRequestConfig = BaseRestRequestConfig<'post'>;
type RestPutRequestConfig = BaseRestRequestConfig<'put'>;
type RestDeleteRequestConfig = BaseRestRequestConfig<'delete'>;
type RestPatchRequestConfig = BaseRestRequestConfig<'patch'>;
type RestOptionsRequestConfig = BaseRestRequestConfig<'options'>;
export type RestRequestConfig =
  | RestGetRequestConfig
  | RestPostRequestConfig
  | RestPutRequestConfig
  | RestDeleteRequestConfig
  | RestPatchRequestConfig
  | RestOptionsRequestConfig;
