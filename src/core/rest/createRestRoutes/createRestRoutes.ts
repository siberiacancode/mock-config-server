import type { IRouter } from 'express';
import { flatten } from 'flat';
import path from 'path';

import {
  asyncHandler,
  callRequestInterceptor,
  callResponseInterceptors,
  convertToEntityDescriptor,
  isEntityDescriptor,
  isFilePathValid,
  resolveEntityValues,
  sleep
} from '@/utils/helpers';
import type {
  EntityDescriptor,
  Entries,
  Interceptors,
  PlainObject,
  RestConfig,
  RestEntitiesByEntityName,
  RestEntity,
  TopLevelPlainEntityArray,
  TopLevelPlainEntityDescriptor
} from '@/utils/types';

import { prepareRestRequestConfigs } from './helpers';

interface CreateRestRoutesParams {
  router: IRouter;
  restConfig: RestConfig;
  serverResponseInterceptor?: Interceptors['response'];
}

export const createRestRoutes = ({
  router,
  restConfig,
  serverResponseInterceptor
}: CreateRestRoutesParams) => {
  prepareRestRequestConfigs(restConfig.configs).forEach((requestConfig) => {
    router.route(requestConfig.path)[requestConfig.method](
      asyncHandler(async (request, response, next) => {
        if (requestConfig.interceptors?.request) {
          await callRequestInterceptor({
            request,
            interceptor: requestConfig.interceptors.request
          });
        }

        const matchedRouteConfig = requestConfig.routes.find(({ entities }) => {
          if (!entities) return true;

          const entries = Object.entries(entities) as Entries<Required<RestEntitiesByEntityName>>;
          return entries.every(([entityName, entityDescriptorOrValue]) => {
            // ✅ important:
            // check whole body as plain value strictly if descriptor used for body
            const isEntityBodyByTopLevelDescriptor =
              entityName === 'body' && isEntityDescriptor(entityDescriptorOrValue);
            if (isEntityBodyByTopLevelDescriptor) {
              const bodyDescriptor: EntityDescriptor = entityDescriptorOrValue;
              if (
                bodyDescriptor.checkMode === 'exists' ||
                bodyDescriptor.checkMode === 'notExists'
              ) {
                return resolveEntityValues({
                  actualValue: request.body,
                  checkMode: bodyDescriptor.checkMode
                });
              }

              return resolveEntityValues({
                actualValue: request.body,
                descriptorValue: bodyDescriptor.value,
                checkMode: bodyDescriptor.checkMode,
                oneOf: bodyDescriptor.oneOf ?? false
              });
            }

            const isEntityBodyByTopLevelArray =
              entityName === 'body' && Array.isArray(entityDescriptorOrValue);
            if (isEntityBodyByTopLevelArray) {
              return resolveEntityValues({
                actualValue: request.body,
                descriptorValue: entityDescriptorOrValue,
                checkMode: 'equals'
              });
            }

            const recordOrArrayEntries = Object.entries(entityDescriptorOrValue) as Entries<
              Exclude<RestEntity, TopLevelPlainEntityDescriptor | TopLevelPlainEntityArray>
            >;
            return recordOrArrayEntries.every(([entityKey, mappedEntityDescriptorOrValue]) => {
              const entityDescriptor = convertToEntityDescriptor(mappedEntityDescriptorOrValue);
              const actualEntity = flatten<PlainObject, PlainObject>(request[entityName]);

              // ✅ important: transform header keys to lower case because browsers send headers in lowercase
              const actualKey = entityName === 'headers' ? entityKey.toLowerCase() : entityKey;
              const actualValue = actualEntity[actualKey];

              if (
                entityDescriptor.checkMode === 'exists' ||
                entityDescriptor.checkMode === 'notExists'
              ) {
                return resolveEntityValues({
                  actualValue,
                  checkMode: entityDescriptor.checkMode
                });
              }

              return resolveEntityValues({
                actualValue,
                descriptorValue: entityDescriptor.value,
                checkMode: entityDescriptor.checkMode,
                oneOf: entityDescriptor.oneOf ?? false
              });
            });
          });
        });

        if (!matchedRouteConfig) {
          return next();
        }

        if (matchedRouteConfig.interceptors?.request) {
          await callRequestInterceptor({
            request,
            interceptor: matchedRouteConfig.interceptors.request
          });
        }

        let matchedRouteConfigData = null;
        if (matchedRouteConfig.settings?.polling && 'queue' in matchedRouteConfig) {
          if (!matchedRouteConfig.queue.length) return next();

          const shallowMatchedRouteConfig =
            matchedRouteConfig as unknown as typeof matchedRouteConfig & {
              __pollingIndex: number;
              __timeoutInProgress: boolean;
            };

          let index = shallowMatchedRouteConfig.__pollingIndex ?? 0;

          const { time, data } = matchedRouteConfig.queue[index];

          const updateIndex = () => {
            if (matchedRouteConfig.queue.length - 1 === index) {
              index = 0;
            } else {
              index += 1;
            }
            shallowMatchedRouteConfig.__pollingIndex = index;
          };

          if (time && !shallowMatchedRouteConfig.__timeoutInProgress) {
            shallowMatchedRouteConfig.__timeoutInProgress = true;
            setTimeout(() => {
              shallowMatchedRouteConfig.__timeoutInProgress = false;
              updateIndex();
            }, time);
          }

          if (!time && !shallowMatchedRouteConfig.__timeoutInProgress) {
            updateIndex();
          }

          matchedRouteConfigData = data;
        }

        if ('data' in matchedRouteConfig) {
          matchedRouteConfigData = matchedRouteConfig.data;
        }

        if ('file' in matchedRouteConfig) {
          if (!isFilePathValid(matchedRouteConfig.file)) return next();
        }

        const resolvedData =
          typeof matchedRouteConfigData === 'function'
            ? await matchedRouteConfigData(request, matchedRouteConfig.entities ?? {})
            : matchedRouteConfigData;

        if (matchedRouteConfig.settings?.status) {
          response.statusCode = matchedRouteConfig.settings.status;
        }

        // ✅ important:
        // set 'Cache-Control' header for explicit browsers response revalidate: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
        // this code should place before response interceptors for giving opportunity to rewrite 'Cache-Control' header
        if (request.method === 'GET') response.set('Cache-control', 'no-cache');

        const data = await callResponseInterceptors({
          data: resolvedData,
          request,
          response,
          interceptors: {
            routeInterceptor: matchedRouteConfig.interceptors?.response,
            requestInterceptor: requestConfig.interceptors?.response,
            apiInterceptor: restConfig.interceptors?.response,
            serverInterceptor: serverResponseInterceptor
          }
        });

        if (matchedRouteConfig.settings?.delay) {
          await sleep(matchedRouteConfig.settings.delay);
        }

        if ('file' in matchedRouteConfig) {
          return response.sendFile(path.resolve(matchedRouteConfig.file));
        }
        return response.json(data);
      })
    );
  });

  return router;
};
