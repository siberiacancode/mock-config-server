import type { IRouter, NextFunction, Request, Response } from 'express';

import {
  isEntityValuesEqual,
  callRequestInterceptors,
  callResponseInterceptors,
  getGraphQLInput,
  parseQuery
} from '@/utils/helpers';
import type {
  GraphQLEntities,
  GraphQLRequestConfig,
  Interceptors,
  PlainObject,
  VariablesValue
} from '@/utils/types';

import { prepareGraphQLRequestConfigs } from './helpers';

export const createGraphQLRoutes = (
  router: IRouter,
  configs: GraphQLRequestConfig[],
  interceptors?: Interceptors
) => {
  const preparedGraphQLRequestConfig = prepareGraphQLRequestConfigs(configs);

  const graphqlMiddleware = (request: Request, response: Response, next: NextFunction) => {
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

    callRequestInterceptors({
      request,
      interceptors: {
        requestInterceptor: matchedRequestConfig.interceptors?.request,
        serverInterceptor: interceptors?.request
      }
    });

    const matchedRouteConfig = matchedRequestConfig.routes.find(({ entities }) => {
      if (!entities) return true;
      return (Object.entries(entities) as [GraphQLEntities, PlainObject | VariablesValue][]).every(
        ([entity, entityValue]) => {
          if (entity === 'variables') {
            return isEntityValuesEqual(entityValue, graphQLInput.variables);
          }

          return isEntityValuesEqual(entityValue, request[entity]);
        }
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
        requestInterceptor: matchedRequestConfig.interceptors?.response,
        serverInterceptor: interceptors?.response
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
