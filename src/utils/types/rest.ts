import type { Request } from 'express';

import type { MappedEntity, PlainEntity } from './entities';
import type { Interceptors } from './interceptors';
import type { Data } from './values';

export type RestMethod = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'options';
export type RestEntityName = 'headers' | 'cookies' | 'query' | 'params' | 'body';

export type RestEntity<EntityName extends RestEntityName = RestEntityName> =
  EntityName extends 'body' ? PlainEntity : MappedEntity;

export type RestEntityNamesByMethod = {
  [key in RestMethod]: key extends 'get' | 'delete' | 'options'
    ? Exclude<RestEntityName, 'body'>
    : RestEntityName;
};
export type RestEntitiesByEntityName<Method extends RestMethod = RestMethod> = {
  [EntityName in RestEntityNamesByMethod[Method]]?: RestEntity<EntityName>;
};

interface RestSettings {
  readonly polling?: boolean;
  readonly status?: number;
  readonly delay?: number;
}

export type RestDataResponse<Method extends RestMethod = RestMethod> =
  | ((request: Request, entities: RestEntitiesByEntityName<Method>) => Data | Promise<Data>)
  | Data;

export type RestFileResponse = string;

export type RestRouteConfig<Method extends RestMethod> = (
  | {
      settings: RestSettings & { polling: true };
      queue: Array<
        | {
            time?: number;
            data: RestDataResponse<Method>;
          }
        | {
            time?: number;
            file: RestFileResponse;
          }
      >;
    }
  | {
      settings?: RestSettings & { polling?: false };
      data: RestDataResponse<Method>;
    }
  | {
      settings?: RestSettings & { polling?: false };
      file: RestFileResponse;
    }
) & { entities?: RestEntitiesByEntityName<Method>; interceptors?: Interceptors };

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
