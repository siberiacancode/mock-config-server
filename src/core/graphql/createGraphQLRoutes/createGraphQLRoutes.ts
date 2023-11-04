import type { IRouter, NextFunction, Request, Response } from 'express';
import { flatten } from 'flat';

import {
  asyncHandler,
  callRequestInterceptor,
  callResponseInterceptors,
  convertToEntityDescriptor,
  getGraphQLInput,
  isEntityDescriptor,
  parseQuery,
  resolveEntityValues
} from '@/utils/helpers';
import type {
  GraphqlConfig,
  GraphQLEntityDescriptorOnly,
  GraphQLEntityDescriptorOrValue,
  GraphQLEntityName,
  GraphQLMappedEntityName,
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
    if (!graphQLInput || !graphQLInput.query) {
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

    if (!query.operationName || !query.operationType) {
      return response.status(400).json({
        message: `You should to specify operationName and operationType for ${request.method}:${request.baseUrl}${request.path}`
      });
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
      const entries = Object.entries(entities) as [
        GraphQLEntityName,
        GraphQLEntityDescriptorOrValue
      ][];
      return entries.every(([entityName, valueOrDescriptor]) => {
        const { checkMode, value: descriptorValue } = convertToEntityDescriptor(valueOrDescriptor);

        // ✅ important: check whole variables as plain value strictly if descriptor used for variables
        const isVariablesPlain =
          entityName === 'variables' && isEntityDescriptor(valueOrDescriptor);
        if (isVariablesPlain) {
          // ✅ important: getGraphQLInput returns empty object if variables not sent or invalid, so count {} as undefined
          return resolveEntityValues(
            checkMode,
            Object.keys(graphQLInput.variables).length ? graphQLInput.variables : undefined,
            descriptorValue
          );
        }

        const mappedEntityDescriptors = Object.entries(valueOrDescriptor) as [
          GraphQLMappedEntityName,
          GraphQLEntityDescriptorOnly<
            Exclude<GraphQLEntityName, 'variables'>
          >[GraphQLMappedEntityName]
        ][];
        return mappedEntityDescriptors.every(([entityKey, mappedEntityDescriptor]) => {
          const { checkMode, value: descriptorValue } =
            convertToEntityDescriptor(mappedEntityDescriptor);
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

    let matchedRouteConfigData = null;
    if (matchedRouteConfig.settings?.polling && 'queue' in matchedRouteConfig) {
      if (!matchedRouteConfig.queue.length) return next();

      const shallowMatchedRouteConfig =
        matchedRouteConfig as unknown as typeof matchedRouteConfig & {
          __pollingIndex: number;
          __timeout: boolean;
        };

      let index = shallowMatchedRouteConfig.__pollingIndex ?? 0;
      if (matchedRouteConfig.queue.length === index) index = 0;

      const { time, data } = matchedRouteConfig.queue[index];

      const updateIndex = () => {
        index += 1;
        shallowMatchedRouteConfig.__pollingIndex = index;
        if (matchedRouteConfig.queue.length === index) index = 0;
      };

      if (time && !shallowMatchedRouteConfig.__timeout) {
        shallowMatchedRouteConfig.__timeout = true;
        setTimeout(() => {
          shallowMatchedRouteConfig.__timeout = false;
          updateIndex();
        }, time);
      }

      if (!time && !shallowMatchedRouteConfig.__timeout) {
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

    const data = await callResponseInterceptors({
      data: resolvedData,
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
