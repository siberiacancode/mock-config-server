import type { IRouter } from 'express';
import { flatten } from 'flat';

import {
  asyncHandler,
  callRequestInterceptor,
  callResponseInterceptors,
  convertToEntityDescriptor,
  isEntityDescriptor,
  resolveEntityValues
} from '@/utils/helpers';
import type {
  Interceptors,
  RestConfig,
  RestEntityDescriptorOnly,
  RestEntityDescriptorOrValue,
  RestEntityName,
  RestMappedEntityKey
} from '@/utils/types';

import { prepareRestRequestConfigs } from './helpers';

export const createRestRoutes = (
  router: IRouter,
  restConfig: RestConfig,
  serverResponseInterceptors?: Interceptors['response']
) => {
  prepareRestRequestConfigs(restConfig.configs).forEach((requestConfig) => {
    router.route(requestConfig.path)[requestConfig.method](
      asyncHandler(async (request, response, next) => {
        const requestInterceptor = requestConfig.interceptors?.request;
        if (requestInterceptor) {
          await callRequestInterceptor({ request, interceptor: requestInterceptor });
        }

        const matchedRouteConfig = requestConfig.routes.find(({ entities }) => {
          if (!entities) return true;
          const entries = Object.entries(entities) as [
            RestEntityName,
            RestEntityDescriptorOrValue
          ][];
          return entries.every(([entityName, valueOrDescriptor]) => {
            const { checkMode, value: descriptorValue } =
              convertToEntityDescriptor(valueOrDescriptor);

            // ✅ important: check whole body as plain value strictly if descriptor used for body
            const isBodyPlain = entityName === 'body' && isEntityDescriptor(valueOrDescriptor);
            if (isBodyPlain) {
              // ✅ important: bodyParser sets body to empty object if body not sent or invalid, so count {} as undefined
              return resolveEntityValues(
                checkMode,
                Object.keys(request.body).length ? request.body : undefined,
                descriptorValue
              );
            }

            const mappedEntityDescriptors = Object.entries(valueOrDescriptor) as [
              RestMappedEntityKey,
              RestEntityDescriptorOnly<Exclude<RestEntityName, 'body'>>[RestMappedEntityKey]
            ][];
            return mappedEntityDescriptors.every(([entityKey, mappedEntityDescriptor]) => {
              const { checkMode, value: descriptorValue } =
                convertToEntityDescriptor(mappedEntityDescriptor);
              const flattenEntity = flatten<any, any>(request[entityName]);
              // ✅ important: transform header keys to lower case because browsers send headers in lowercase
              return resolveEntityValues(
                checkMode,
                flattenEntity[entityName === 'headers' ? entityKey.toLowerCase() : entityKey],
                descriptorValue
              );
            });
          });
        });

        if (!matchedRouteConfig) {
          return next();
        }

        let matchedRouteConfigData = null;
        if (matchedRouteConfig.settings?.polling && 'queue' in matchedRouteConfig) {
          if (!matchedRouteConfig.queue.length) return next();

          const shallowMatchedRouteConfig =
            matchedRouteConfig as unknown as typeof matchedRouteConfig & {
              __pollingIndex: number;
              __timeout: boolean;
            };

          let index = shallowMatchedRouteConfig.__pollingIndex ?? 0;
          if (matchedRouteConfig.queue.length === index) index = 0;

          const { time, data } = matchedRouteConfig.queue[index];

          const updateIndex = () => {
            index += 1;
            shallowMatchedRouteConfig.__pollingIndex = index;
            if (matchedRouteConfig.queue.length === index) index = 0;
          };

          if (time && !shallowMatchedRouteConfig.__timeout) {
            shallowMatchedRouteConfig.__timeout = true;
            setTimeout(() => {
              shallowMatchedRouteConfig.__timeout = false;
              updateIndex();
            }, time);
          }

          if (!time && !shallowMatchedRouteConfig.__timeout) {
            updateIndex();
          }

          matchedRouteConfigData = data;
        }

        if ('data' in matchedRouteConfig) {
          matchedRouteConfigData = matchedRouteConfig.data;
        }

        const resolvedData =
          typeof matchedRouteConfigData === 'function'
            ? await matchedRouteConfigData(request, matchedRouteConfig.entities ?? {})
            : matchedRouteConfigData;

        const data = await callResponseInterceptors({
          data: resolvedData,
          request,
          response,
          interceptors: {
            routeInterceptor: matchedRouteConfig.interceptors?.response,
            requestInterceptor: requestConfig.interceptors?.response,
            apiInterceptor: restConfig.interceptors?.response,
            serverInterceptor: serverResponseInterceptors
          }
        });

        // ✅ important:
        // set 'Cache-Control' header for explicit browsers response revalidate
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
        response.set('Cache-control', 'max-age=0, must-revalidate');
        return response.status(response.statusCode).json(data);
      })
    );
  });

  return router;
};
