import type { IRouter } from 'express';

import {
  resolveEntityValues,
  callResponseInterceptors,
  callRequestInterceptor,
} from '@/utils/helpers';
import type {
  Interceptors,
  RestConfig,
  RestEntityDescriptorOrValue,
  RestEntityName,
  RestObjectEntityKey,
  RestEntityDescriptorOnly
} from '@/utils/types';

import { prepareRestRequestConfigs } from './helpers';

export const createRestRoutes = (
  router: IRouter,
  restConfig: RestConfig,
  serverResponseInterceptors?: Interceptors['response']
) => {
  prepareRestRequestConfigs(restConfig.configs).forEach((requestConfig) => {
    router.route(requestConfig.path)[requestConfig.method](async (request, response, next) => {
      const requestInterceptor = requestConfig.interceptors?.request;
      if (requestInterceptor) {
        await callRequestInterceptor({ request, interceptor: requestInterceptor });
      }

      const matchedRouteConfig = requestConfig.routes.find(({ entities }) => {
        if (!entities) return true;
        const entries = Object.entries(entities) as [RestEntityName, RestEntityDescriptorOrValue][];
        return entries.every(([entityName, entityDescriptorOrValue]) => {
          if (entityName === 'body') {
            const descriptor = entityDescriptorOrValue && typeof entityDescriptorOrValue === 'object' && 'checkMode' in entityDescriptorOrValue ? entityDescriptorOrValue : { checkMode: 'equals', value: entityDescriptorOrValue };
            const { checkMode, value: descriptorValue } = descriptor as RestEntityDescriptorOnly<'body'>;
            return resolveEntityValues(checkMode, request[entityName], descriptorValue);
          }
          const objectEntityDescriptors = Object.entries(entityDescriptorOrValue) as [RestObjectEntityKey, RestEntityDescriptorOnly<Exclude<RestEntityName, 'body'>>[RestObjectEntityKey]][];
          return objectEntityDescriptors.every(([entityKey, objectEntityDescriptor]) => {
            const descriptor = (objectEntityDescriptor && typeof objectEntityDescriptor === 'object' && 'checkMode' in objectEntityDescriptor ? objectEntityDescriptor : { checkMode: 'equals' as const, value: objectEntityDescriptor });
            const { checkMode, value: descriptorValue } = descriptor;
            return resolveEntityValues(checkMode, request[entityName][entityKey], descriptorValue);
          })
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
    });
  });

  return router;
};
