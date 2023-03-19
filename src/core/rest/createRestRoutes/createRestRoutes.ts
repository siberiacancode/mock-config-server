import { IRouter } from 'express';

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
    router.route(requestConfig.path)[requestConfig.method]((request, response, next) => {
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

      const data = callResponseInterceptors({
        data: matchedRouteConfig.data,
        request,
        response,
        interceptors: {
          routeInterceptor: matchedRouteConfig.interceptors?.response,
          requestInterceptor: requestConfig.interceptors?.response,
          serverInterceptor: interceptors?.response
        }
      });
      return response.status(response.statusCode).json(data);
    });
  });

  return router;
};
