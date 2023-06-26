import type { IRouter } from 'express';

import {
  isEntityValuesEqual,
  callResponseInterceptors,
  callRequestInterceptor,
  asyncHandler
} from '@/utils/helpers';
import type { Interceptors, RestConfig, RestEntities, RestEntitiesValue } from '@/utils/types';

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
