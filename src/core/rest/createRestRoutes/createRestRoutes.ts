import type { IRouter } from 'express';
import { flatten } from 'flat';

import {
  asyncHandler,
  resolveEntityValues,
  callResponseInterceptors,
  callRequestInterceptor,
  convertToEntityDescriptor,
  isEntityDescriptor
} from '@/utils/helpers';
import type {
  Entries,
  Interceptors,
  RestConfig,
  RestEntitiesByEntityName,
  RestEntityDescriptorOrValue,
  RestTopLevelPlainEntityDescriptor
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

          const entries = Object.entries(entities) as Entries<Required<RestEntitiesByEntityName>>;
          return entries.every(([entityName, valueOrDescriptor]) => {
            const { checkMode, value: descriptorValue } =
              convertToEntityDescriptor(valueOrDescriptor);

            // ✅ important: check whole body as plain value strictly if descriptor used for body
            const isEntityBodyByTopLevelDescriptor =
              entityName === 'body' && isEntityDescriptor(valueOrDescriptor);
            if (isEntityBodyByTopLevelDescriptor) {
              // ✅ important: bodyParser sets body to empty object if body not sent or invalid, so assume {} as undefined
              return resolveEntityValues(
                checkMode,
                Object.keys(request.body).length ? request.body : undefined,
                descriptorValue
              );
            }

            const recordOrArrayEntries = Object.entries(valueOrDescriptor) as Entries<
              Exclude<RestEntityDescriptorOrValue, RestTopLevelPlainEntityDescriptor>
            >;
            return recordOrArrayEntries.every(([entityKey, mappedEntityDescriptor]) => {
              const { checkMode, value: descriptorValue } =
                convertToEntityDescriptor(mappedEntityDescriptor);
              const flattenEntity = flatten<any, any>(request[entityName]);
              // ✅ important: transform header keys to lower case because browsers send headers in lowercase
              return resolveEntityValues(
                checkMode,
                flattenEntity[
                  entityName === 'headers' ? (entityKey as string).toLowerCase() : entityKey
                ],
                descriptorValue
              );
            });
          });
        });

        if (!matchedRouteConfig) {
          return next();
        }

        const matchedRouteConfigData =
          typeof matchedRouteConfig.data === 'function'
            ? await matchedRouteConfig.data(request, matchedRouteConfig.entities ?? {})
            : matchedRouteConfig.data;

        const data = await callResponseInterceptors({
          data: matchedRouteConfigData,
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
