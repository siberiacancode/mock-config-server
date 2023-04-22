import type { IRouter } from 'express';

import {
  isEntityValuesEqual,
  callRequestInterceptors,
  callResponseInterceptors
} from '@/utils/helpers';
import type {
  Interceptors,
  RestEntities,
  RestEntitiesValue,
  RestRequestConfig
} from '@/utils/types';

import { prepareRestRequestConfigs } from './helpers';

export const createRestRoutes = (
  router: IRouter,
  configs: RestRequestConfig[],
  interceptors?: Interceptors
) => {
  prepareRestRequestConfigs(configs).forEach((requestConfig) => {
    router.route(requestConfig.path)[requestConfig.method](async (request, response, next) => {
      callRequestInterceptors({
        request,
        interceptors: {
          requestInterceptor: requestConfig.interceptors?.request,
          serverInterceptor: interceptors?.request
        }
      });

      const matchedRouteConfig = requestConfig.routes.find(({ entities }) => {
        if (!entities) return true;
        return (Object.entries(entities) as [RestEntities, RestEntitiesValue][]).every(
          ([entity, entityValue]) => isEntityValuesEqual(entityValue, request[entity])
        );
      });

      if (!matchedRouteConfig) {
        return next();
      }

      const matchedRouteConfigData =
        typeof matchedRouteConfig.data === 'function'
          ? await matchedRouteConfig.data(request, matchedRouteConfig.entities ?? {})
          : matchedRouteConfig.data;

      const data = callResponseInterceptors({
        data: matchedRouteConfigData,
        request,
        response,
        interceptors: {
          routeInterceptor: matchedRouteConfig.interceptors?.response,
          requestInterceptor: requestConfig.interceptors?.response,
          serverInterceptor: interceptors?.response
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
