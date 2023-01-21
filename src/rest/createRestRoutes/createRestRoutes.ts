import { IRouter } from 'express';

import { isEntityValuesEqual } from '../../configs/isEntitiesEqual/isEntityValuesEqual';
import { callRequestInterceptors } from '../../routes/callRequestInterceptors/callRequestInterceptors';
import { callResponseInterceptors } from '../../routes/callResponseInterceptors/callResponseInterceptors';
import type {
  Interceptors,
  RestEntities,
  RestEntitiesValue,
  RestRequestConfig
} from '../../utils/types';
import { prepareRestRequestConfigs } from '../prepareRestRequestConfigs/prepareRestRequestConfigs';

export const createRestRoutes = (
  router: IRouter,
  configs: RestRequestConfig[],
  interceptors?: Interceptors
) => {
  prepareRestRequestConfigs(configs).forEach((requestConfig) => {
    router.route(requestConfig.path)[requestConfig.method]((request, response) => {
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
        return response
          .status(404)
          .json(`No data for ${request.method}:${request.baseUrl}${request.path}`);
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
