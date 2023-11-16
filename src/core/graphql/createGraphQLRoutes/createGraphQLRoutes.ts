import type { IRouter, NextFunction, Request, Response } from 'express';
import { flatten } from 'flat';

import {
  asyncHandler,
  resolveEntityValues,
  callResponseInterceptors,
  getGraphQLInput,
  parseQuery,
  callRequestInterceptor,
  convertToEntityDescriptor,
  isEntityDescriptor
} from '@/utils/helpers';
import type {
  Entries,
  GraphQLEntitiesByEntityName,
  GraphqlConfig,
  GraphQLEntityDescriptorOrValue,
  GraphQLTopLevelPlainEntityDescriptor,
  Interceptors
} from '@/utils/types';

import { prepareGraphQLRequestConfigs } from './helpers';

export const createGraphQLRoutes = (
  router: IRouter,
  graphqlConfig: GraphqlConfig,
  serverResponseInterceptors?: Interceptors['response']
) => {
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

      if ('query' in requestConfig && requestConfig.query !== graphQLInput.query) return false;

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
          Exclude<GraphQLEntityDescriptorOrValue, GraphQLTopLevelPlainEntityDescriptor | Array<any>>
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
        requestInterceptor: matchedRequestConfig.interceptors?.response,
        apiInterceptor: graphqlConfig.interceptors?.response,
        serverInterceptor: serverResponseInterceptors
      }
    });

    // ✅ important:
    // set 'Cache-Control' header for explicit browsers response revalidate
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
    response.set('Cache-control', 'max-age=0, must-revalidate');
    return response.status(response.statusCode).json(data);
  };

  router.route('/').get(asyncHandler(graphqlMiddleware));
  router.route('/').post(asyncHandler(graphqlMiddleware));

  return router;
};
