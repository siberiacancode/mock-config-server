import type { IRouter } from 'express';

import { isEntityValuesEqual } from '../../configs/isEntitiesEqual/isEntityValuesEqual';
import { prepareRequestConfigs } from '../../configs/prepareRequestConfigs/prepareRequestConfigs';
import type { BodyValue, Entities, MockServerConfig, PlainObject } from '../../utils/types';
import { callRequestInterceptors } from '../callRequestInterceptors/callRequestInterceptors';
import { callResponseInterceptors } from '../callResponseInterceptors/callResponseInterceptors';

export const createRoutes = (
  router: IRouter,
  mockServerConfig: Pick<MockServerConfig, 'configs' | 'interceptors'>
) => {
  prepareRequestConfigs(mockServerConfig.configs).forEach((requestConfig) => {
    router.route(requestConfig.path)[requestConfig.method]((request, response) => {
      callRequestInterceptors({
        request,
        interceptors: {
          requestInterceptor: requestConfig.interceptors?.request,
          serverInterceptor: mockServerConfig.interceptors?.request
        }
      });

      const matchedRouteConfig = requestConfig.routes.find(({ entities }) => {
        if (!entities) return true;
        return (Object.entries(entities) as [Entities, PlainObject | BodyValue][]).every(
          ([entity, entityValue]) =>
            isEntityValuesEqual<typeof entity>(entityValue, request[entity])
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
          serverInterceptor: mockServerConfig.interceptors?.response
        }
      });
      return response.status(response.statusCode).json(data);
    });
  });

  return router;
};
