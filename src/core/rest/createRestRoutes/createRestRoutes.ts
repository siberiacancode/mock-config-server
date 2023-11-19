import type { IRouter } from 'express';
import { flatten } from 'flat';

import {
  asyncHandler,
  callRequestInterceptor,
  callRequestLogger,
  callResponseInterceptors,
  callResponseLoggers,
  convertToEntityDescriptor,
  isEntityDescriptor,
  resolveEntityValues
} from '@/utils/helpers';
import type {
  Interceptors,
  Loggers,
  RestConfig,
  RestEntityDescriptorOnly,
  RestEntityDescriptorOrValue,
  RestEntityName,
  RestMappedEntityKey
} from '@/utils/types';

import { prepareRestRequestConfigs } from './helpers';

interface CreateRestRoutesParams {
  router: IRouter;
  restConfig: RestConfig;
  apiInterceptors?: Interceptors;
  serverInterceptors?: Interceptors;
  apiLoggers?: Loggers;
  serverLoggers?: Loggers;
}

export const createRestRoutes = ({
  router,
  restConfig,
  apiInterceptors,
  serverInterceptors,
  apiLoggers,
  serverLoggers
}: CreateRestRoutesParams) => {
  prepareRestRequestConfigs(restConfig.configs).forEach((requestConfig) => {
    router.route(requestConfig.path)[requestConfig.method](
      asyncHandler(async (request, response, next) => {
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

        let isRequestLoggerResolved = !!serverLoggers?.request;

        const apiRequestInterceptor = apiInterceptors?.request;
        if (apiRequestInterceptor) {
          await callRequestInterceptor({ request, interceptor: apiRequestInterceptor });
        }
        const apiRequestLogger = apiLoggers?.request;
        if (!isRequestLoggerResolved && apiRequestLogger) {
          await callRequestLogger({ request, logger: apiRequestLogger });
          isRequestLoggerResolved = true;
        }

        const requestRequestInterceptor = requestConfig.interceptors?.request;
        if (requestRequestInterceptor) {
          await callRequestInterceptor({ request, interceptor: requestRequestInterceptor });
        }
        const requestRequestLogger = requestConfig.loggers?.request;
        if (!isRequestLoggerResolved && requestRequestLogger) {
          await callRequestLogger({ request, logger: requestRequestLogger });
          isRequestLoggerResolved = true;
        }

        if (!matchedRouteConfig) {
          return next();
        }

        const routeRequestLogger = matchedRouteConfig.loggers?.request;
        if (routeRequestLogger) {
          await callRequestLogger({ request, logger: routeRequestLogger });
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
            serverInterceptor: serverInterceptors?.response
          }
        });

        await callResponseLoggers({
          request,
          response,
          responseLoggers: {
            routeLogger: matchedRouteConfig.loggers?.response,
            requestLogger: requestConfig.loggers?.response,
            apiLogger: restConfig.loggers?.response,
            serverLogger: serverLoggers?.response
          },
          data
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
