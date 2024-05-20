import type { IRouter, NextFunction, Request, Response } from 'express';
import { flatten } from 'flat';

import {
  asyncHandler,
  callRequestInterceptor,
  callRequestLogger,
  callResponseInterceptors,
  callResponseLogger,
  convertToEntityDescriptor,
  getGraphQLInput,
  isEntityDescriptor,
  parseQuery,
  resolveEntityValues,
  sleep
} from '@/utils/helpers';
import type {
  Entries,
  GraphqlConfig,
  GraphQLEntitiesByEntityName,
  GraphQLEntity,
  Interceptors,
  Loggers,
  TopLevelPlainEntityArray,
  TopLevelPlainEntityDescriptor
} from '@/utils/types';

import { prepareGraphQLRequestConfigs } from './helpers';

interface CreateGraphQLRoutesParams {
  router: IRouter;
  graphqlConfig: GraphqlConfig;
  serverResponseInterceptor?: Interceptors['response'];
  loggers?: Loggers;
}

export const createGraphQLRoutes = ({
  router,
  graphqlConfig,
  serverResponseInterceptor,
  loggers
}: CreateGraphQLRoutesParams) => {
  const preparedGraphQLRequestConfig = prepareGraphQLRequestConfigs(graphqlConfig.configs);

  const graphqlMiddleware = async (request: Request, response: Response, next: NextFunction) => {
    const graphQLInput = getGraphQLInput(request);
    if (!graphQLInput.query) {
      return response
        .status(400)
        .json({ message: 'Query is missing, you must pass a valid GraphQL query' });
    }

    const query = parseQuery(graphQLInput.query);
    if (!query) {
      return response
        .status(400)
        .json({ message: 'Query is invalid, you must use a valid GraphQL query' });
    }

    const matchedRequestConfig = preparedGraphQLRequestConfig.find((requestConfig) => {
      if (requestConfig.operationType !== query.operationType) return false;

      if (
        'query' in requestConfig &&
        requestConfig.query.replace(/\s+/gi, ' ') !== graphQLInput.query?.replace(/\s+/gi, ' ')
      )
        return false;

      if ('operationName' in requestConfig) {
        if (!query.operationName) return false;

        if (requestConfig.operationName instanceof RegExp)
          return new RegExp(requestConfig.operationName).test(query.operationName);

        return requestConfig.operationName === query.operationName;
      }

      return true;
    });

    if (!matchedRequestConfig) {
      return next();
    }

    const requestInterceptor = matchedRequestConfig.interceptors?.request;
    if (requestInterceptor) {
      await callRequestInterceptor({ request, interceptor: requestInterceptor });
    }

    const matchedRouteConfig = matchedRequestConfig.routes.find(({ entities }) => {
      if (!entities) return true;

      const entries = Object.entries(entities) as Entries<Required<GraphQLEntitiesByEntityName>>;
      return entries.every(([entityName, entityDescriptorOrValue]) => {
        const { checkMode, value: entityDescriptorValue } =
          convertToEntityDescriptor(entityDescriptorOrValue);

        // ✅ important: check whole variables as plain value strictly if descriptor used for variables
        const isEntityVariablesByTopLevelDescriptor =
          entityName === 'variables' && isEntityDescriptor(entityDescriptorOrValue);
        if (isEntityVariablesByTopLevelDescriptor) {
          return resolveEntityValues(checkMode, graphQLInput.variables, entityDescriptorValue);
        }

        const isEntityVariablesByTopLevelArray =
          entityName === 'variables' && Array.isArray(entityDescriptorOrValue);
        if (isEntityVariablesByTopLevelArray) {
          return entityDescriptorOrValue.some((entityDescriptorOrValueElement) =>
            resolveEntityValues(checkMode, graphQLInput.variables, entityDescriptorOrValueElement)
          );
        }

        const recordOrArrayEntries = Object.entries(entityDescriptorOrValue) as Entries<
          Exclude<GraphQLEntity, TopLevelPlainEntityDescriptor | TopLevelPlainEntityArray>
        >;
        return recordOrArrayEntries.every(([entityKey, entityValue]) => {
          const { checkMode, value: descriptorValue } = convertToEntityDescriptor(entityValue);
          const flattenEntity = flatten<any, any>(
            entityName === 'variables' ? graphQLInput.variables : request[entityName]
          );

          // ✅ important: transform header keys to lower case because browsers send headers in lowercase
          return resolveEntityValues(
            checkMode,
            flattenEntity[entityName === 'headers' ? entityKey.toLowerCase() : entityKey],
            descriptorValue
          );
        });
      });
    });

    if (!matchedRouteConfig) return next();

    const requestLogger = loggers?.request;
    if (requestLogger) {
      await callRequestLogger({ request, logger: requestLogger });
    }

    let matchedRouteConfigData = null;
    if (matchedRouteConfig.settings?.polling && 'queue' in matchedRouteConfig) {
      if (!matchedRouteConfig.queue.length) return next();

      const shallowMatchedRouteConfig =
        matchedRouteConfig as unknown as typeof matchedRouteConfig & {
          __pollingIndex: number;
          __timeoutInProgress: boolean;
        };

      let index = shallowMatchedRouteConfig.__pollingIndex ?? 0;

      const { time, data } = matchedRouteConfig.queue[index];

      const updateIndex = () => {
        if (matchedRouteConfig.queue.length - 1 === index) {
          index = 0;
        } else {
          index += 1;
        }
        shallowMatchedRouteConfig.__pollingIndex = index;
      };

      if (time && !shallowMatchedRouteConfig.__timeoutInProgress) {
        shallowMatchedRouteConfig.__timeoutInProgress = true;
        setTimeout(() => {
          shallowMatchedRouteConfig.__timeoutInProgress = false;
          updateIndex();
        }, time);
      }

      if (!time && !shallowMatchedRouteConfig.__timeoutInProgress) {
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

    if (matchedRouteConfig.settings?.status) {
      response.statusCode = matchedRouteConfig.settings.status;
    }

    // ✅ important:
    // set 'Cache-Control' header for explicit browsers response revalidate: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
    // this code should place before response interceptors for giving opportunity to rewrite 'Cache-Control' header
    if (matchedRequestConfig.operationType === 'query') response.set('Cache-control', 'no-cache');

    const data = await callResponseInterceptors({
      data: resolvedData,
      request,
      response,
      interceptors: {
        routeInterceptor: matchedRouteConfig.interceptors?.response,
        requestInterceptor: matchedRequestConfig.interceptors?.response,
        apiInterceptor: graphqlConfig.interceptors?.response,
        serverInterceptor: serverResponseInterceptor
      }
    });

    if (matchedRouteConfig.settings?.delay) {
      await sleep(matchedRouteConfig.settings.delay);
    }

    const responseLogger = loggers?.response;
    if (responseLogger) {
      await callResponseLogger({
        request,
        response,
        logger: responseLogger,
        data
      });
    }

    return response.json(data);
  };

  router.route('/').get(asyncHandler(graphqlMiddleware));
  router.route('/').post(asyncHandler(graphqlMiddleware));

  return router;
};
