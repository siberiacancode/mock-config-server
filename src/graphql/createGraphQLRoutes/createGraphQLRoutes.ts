import { IRouter, NextFunction, Request, Response } from 'express';

import { isEntityValuesEqual } from '../../configs/isEntitiesEqual/isEntityValuesEqual';
import { callRequestInterceptors } from '../../routes/callRequestInterceptors/callRequestInterceptors';
import { callResponseInterceptors } from '../../routes/callResponseInterceptors/callResponseInterceptors';
import type {
  GraphQLEntities,
  GraphQLRequestConfig,
  Interceptors,
  PlainObject,
  VariablesValue
} from '../../utils/types';
import { RestMethod, RestRouteConfigEntities } from '../../utils/types';
import { getGraphQLInput } from '../getGraphQLInput/getGraphQLInput';
import { parseQuery } from '../parseQuery/parseQuery';
import { prepareGraphQLRequestConfigs } from '../prepareGraphQLRequestConfigs/prepareGraphQLRequestConfigs';

export const createGraphQLRoutes = (
  router: IRouter,
  configs: GraphQLRequestConfig[],
  interceptors?: Interceptors
) => {
  const preparedGraphQLRequestConfig = prepareGraphQLRequestConfigs(configs);

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

    const entities: RestRouteConfigEntities<RestMethod> = {
      headers: request.headers,
      params: request.params,
      query: request.query,
      body: request.body
    };

    const matchedRouteConfigData =
      typeof matchedRouteConfig.data === 'function'
        ? await matchedRouteConfig.data(request, entities)
        : matchedRouteConfig.data;

    const data = callResponseInterceptors({
      data: matchedRouteConfigData,
      request,
      response,
      interceptors: {
        routeInterceptor: matchedRouteConfig.interceptors?.response,
        requestInterceptor: matchedRequestConfig.interceptors?.response,
        serverInterceptor: interceptors?.response
      }
    });

    return response.status(response.statusCode).json(data);
  };

  router.route('/').get(graphqlMiddleware);
  router.route('/').post(graphqlMiddleware);

  return router;
};
