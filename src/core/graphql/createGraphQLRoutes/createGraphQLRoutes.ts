import type { IRouter, NextFunction, Request, Response } from 'express';

import {
  resolveEntityValues,
  callResponseInterceptors,
  getGraphQLInput,
  parseQuery,
  callRequestInterceptor
} from '@/utils/helpers';
import type {
  GraphqlConfig,
  Interceptors,
  GraphQLEntityDescriptorOrValue,
  GraphQLEntityName,
  GraphQLObjectEntityName,
  GraphQLEntityDescriptorOnly
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
    if (!graphQLInput || !graphQLInput.query) {
      return response.status(400).json('Query is missing, you must pass a valid GraphQL query');
    }

    const query = parseQuery(graphQLInput.query);

    if (!query) {
      return response.status(400).json('Query is invalid, you must use a valid GraphQL query');
    }

    if (!query.operationName || !query.operationType) {
      return response
        .status(400)
        .json(
          `You should to specify operationName and operationType for ${request.method}:${request.baseUrl}${request.path}`
        );
    }

    const matchedRequestConfig = preparedGraphQLRequestConfig.find((requestConfig) => {
      if (requestConfig.operationName instanceof RegExp) {
        return (
          new RegExp(requestConfig.operationName).test(query.operationName) &&
          requestConfig.operationType === query.operationType
        );
      }

      return (
        requestConfig.operationName === query.operationName &&
        requestConfig.operationType === query.operationType
      );
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
      const entries = Object.entries(entities) as [GraphQLEntityName, GraphQLEntityDescriptorOrValue][];
      return entries.every(([entityName, entityDescriptorOrValue]) => {
        if (entityName === 'variables') {
          const descriptor = entityDescriptorOrValue && typeof entityDescriptorOrValue === 'object' && 'checkMode' in entityDescriptorOrValue ? entityDescriptorOrValue : { checkMode: 'equals', value: entityDescriptorOrValue };
          const { checkMode, value: descriptorValue } = descriptor as GraphQLEntityDescriptorOnly<'variables'>;
          return resolveEntityValues(checkMode, graphQLInput.variables, descriptorValue);
        }
        const objectEntityDescriptors = Object.entries(entityDescriptorOrValue) as [GraphQLObjectEntityName, GraphQLEntityDescriptorOnly<Exclude<GraphQLEntityName, 'variables'>>[GraphQLObjectEntityName]][];
        return objectEntityDescriptors.every(([entityKey, objectEntityDescriptor]) => {
          const descriptor = (objectEntityDescriptor && typeof objectEntityDescriptor === 'object' && 'checkMode' in objectEntityDescriptor ? objectEntityDescriptor : { checkMode: 'equals' as const, value: objectEntityDescriptor });
          const { checkMode, value: descriptorValue } = descriptor;
          return resolveEntityValues(checkMode, request[entityName][entityKey], descriptorValue);
        })
        }
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

  router.route('/').get(graphqlMiddleware);
  router.route('/').post(graphqlMiddleware);

  return router;
};
