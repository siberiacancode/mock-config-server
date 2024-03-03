import type { Request } from 'express';

import type {
  CheckActualValueCheckMode,
  CheckFunction,
  CheckMode,
  CompareWithDescriptorAnyValueCheckMode,
  CompareWithDescriptorValueCheckMode
} from './checkModes';
import type { Interceptors } from './interceptors';
import type { NestedObjectOrArray } from './utils';
import type { Data } from './values';

export type RestMethod = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'options';
export type RestEntityName = 'headers' | 'cookies' | 'query' | 'params' | 'body';

type RestPlainEntityValue = string | number | boolean | null;
type RestMappedEntityValue = string | number | boolean;

export type RestTopLevelPlainEntityDescriptor<Check extends CheckMode = CheckMode> =
  Check extends 'function'
    ? {
        checkMode: Check;
        value: (
          actualValue: NestedObjectOrArray<RestPlainEntityValue>,
          checkFunction: CheckFunction
        ) => boolean;
      }
    : Check extends CompareWithDescriptorAnyValueCheckMode
    ? {
        checkMode: Check;
        value: NestedObjectOrArray<RestPlainEntityValue>;
      }
    : Check extends CheckActualValueCheckMode
    ? {
        checkMode: Check;
        value?: never;
      }
    : never;

type RestPropertyLevelPlainEntityDescriptor<Check extends CheckMode = CheckMode> =
  Check extends 'function'
    ? {
        checkMode: Check;
        value: (
          actualValue: RestPlainEntityValue | NestedObjectOrArray<RestPlainEntityValue>,
          checkFunction: CheckFunction
        ) => boolean;
      }
    : Check extends CompareWithDescriptorAnyValueCheckMode
    ? {
        checkMode: Check;
        value: RestPlainEntityValue | NestedObjectOrArray<RestPlainEntityValue>;
      }
    : Check extends CheckActualValueCheckMode
    ? {
        checkMode: Check;
        value?: never;
      }
    : never;

type RestMappedEntityDescriptor<Check extends CheckMode = CheckMode> = Check extends 'function'
  ? {
      checkMode: Check;
      value: (actualValue: RestMappedEntityValue, checkFunction: CheckFunction) => boolean;
    }
  : Check extends 'regExp'
  ? {
      checkMode: Check;
      value: RegExp | RegExp[];
    }
  : Check extends CompareWithDescriptorValueCheckMode
  ? {
      checkMode: Check;
      value: RestMappedEntityValue | RestMappedEntityValue[];
    }
  : Check extends CheckActualValueCheckMode
  ? {
      checkMode: Check;
      value?: never;
    }
  : never;

export type RestEntityDescriptorOrValue<EntityName extends RestEntityName = RestEntityName> =
  EntityName extends 'body'
    ?
        | RestTopLevelPlainEntityDescriptor
        | Record<string, RestPropertyLevelPlainEntityDescriptor>
        | NestedObjectOrArray<RestPlainEntityValue>
    : Record<string, RestMappedEntityDescriptor | RestMappedEntityValue | RestMappedEntityValue[]>;

export type RestEntityNamesByMethod = {
  [key in RestMethod]: key extends 'get' | 'delete' | 'options'
    ? Exclude<RestEntityName, 'body'>
    : RestEntityName;
};
export type RestEntitiesByEntityName<Method extends RestMethod = RestMethod> = {
  [EntityName in RestEntityNamesByMethod[Method]]?: RestEntityDescriptorOrValue<EntityName>;
};

interface RestSettings {
  readonly polling?: boolean;
  readonly status?: number;
  readonly delay?: number;
}

export type RestRouteConfig<
  Method extends RestMethod,
  Entities extends RestEntitiesByEntityName<Method> = RestEntitiesByEntityName<Method>,
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
interface BaseRestRequestConfig<Method extends RestMethod> {
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
