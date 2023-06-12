import type { IRouter } from 'express';

import {
  isEntityValuesEqual,
  callResponseInterceptors,
  callRequestInterceptor,
} from '@/utils/helpers';
import type {
  Interceptors,
  RestConfig,
  RestEntity,
  RestEntityName,
  RestHeaderOrCookieOrQueryOrParamsName,
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
        const entries = Object.entries(entities) as [RestEntityName, RestEntity][];
        return entries.every(([entityName, rawEntities]) => {
          const entitiesDescriptor = rawEntities && typeof rawEntities === 'object' && 'checkMode' in rawEntities ? rawEntities : { checkMode: 'equals', value: rawEntities };
          if (entityName === 'body') {
            const { value: expectedValue, checkMode } = entitiesDescriptor as RestEntityDescriptorOnly<'body'>;
            return isEntityValuesEqual(checkMode, request[entityName], expectedValue);
          }
          const descriptors = Object.entries(entitiesDescriptor) as [RestHeaderOrCookieOrQueryOrParamsName, RestEntityDescriptorOnly<Exclude<RestEntityName, 'body'>>[RestHeaderOrCookieOrQueryOrParamsName]][];
          return descriptors.every(([entityKey, entityDescriptor]) => {
            const { value: expectedValue, checkMode } = entityDescriptor;
            return isEntityValuesEqual(checkMode, request[entityName][entityKey], expectedValue);
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
