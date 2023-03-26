// @ts-nocheck
// because typescript is looking at real mock-server.config and
// there will be high amount of type-check errors if REST or GraphQL configs are missing.
// you can remove this if your config contains REST and GraphQL
import deepEqual from 'deep-equal';

import { config } from '../../../mock-server.config';
import { GraphQLRouteConfig, RestRouteConfig } from '../../../src/utils/types';

const getRestClient = () => {
  const { rest } = config;

  const [{ someMethod, somePath }] = rest.configs.map(({ method, path }) => ({
    someMethod: method,
    somePath: path
  }));

  type RestClient = <Method extends typeof someMethod, Path extends typeof somePath>(
    method: Method,
    path: Path,
    params?: RestRouteConfig<Method>['entities']
  ) => RestRouteConfig<Method>['data'];

  const restClient: RestClient = (method, path, params) => {
    const config = rest.configs.find((config) => config.method === method && config.path === path);

    if (!config) {
      const actualRequest = `${method.toUpperCase()} ${path}`;
      const possibleRequests = rest.configs.map(
        (config) => `\n - ${config.method.toUpperCase()} ${config.path}`
      );
      throw new Error(
        'Wrong method or path.\n' +
          `Received request: ${actualRequest}\n` +
          `Possible requests:${possibleRequests}`
      );
    }

    const route = (config.routes as any as RestRouteConfig<typeof method>[]).find((route) =>
      deepEqual(params, route.entities)
    );

    if (!route) {
      const actualParams = JSON.stringify(params);
      const possibleParamsForRequest = (
        config.routes as any as RestRouteConfig<typeof method>[]
      ).map((route) => `\n${JSON.stringify(route.entities)}`);
      throw new Error(
        'Wrong params.\n' +
          `Received params: ${actualParams}\n` +
          `Possible params for this request:${possibleParamsForRequest}`
      );
    }

    return route.data;
  };

  return restClient;
};

const getGraphqlClient = () => {
  const { graphql } = config;

  const [{ someOperationType, someOperationName }] = graphql.configs.map(
    ({ operationType, operationName }) => ({
      someOperationType: operationType,
      someOperationName: operationName
    })
  );

  type GraphQLClient = <
    OperationType extends typeof someOperationType,
    OperationName extends typeof someOperationName
  >(
    operationType: OperationType,
    operationName: OperationName,
    params?: GraphQLRouteConfig['entities']
  ) => GraphQLRouteConfig['data'];

  const graphQLClient: GraphQLClient = (operationType, operationName, params) => {
    const config = graphql.configs.find(
      (config) => config.operationType === operationType && config.operationName === operationName
    );

    if (!config) {
      const actualRequest = `${operationType} ${operationName}`;
      const possibleRequests = graphql.configs.map(
        (config) => `\n - ${config.operationType} ${config.operationName}`
      );
      throw new Error(
        'Wrong operationType or operationName.\n' +
          `Received request: ${actualRequest}\n` +
          `Possible requests:${possibleRequests}`
      );
    }

    const route = (config.routes as any as GraphQLRouteConfig[]).find((route) =>
      deepEqual(params, route.entities)
    );

    if (!route) {
      const actualParams = JSON.stringify(params);
      const possibleParamsForRequest = (config.routes as any as GraphQLRouteConfig[]).map(
        (route) => `\n${JSON.stringify(route.entities)}`
      );
      throw new Error(
        'Wrong params.\n' +
          `Received params: ${actualParams}\n` +
          `Possible params for this request:${possibleParamsForRequest}`
      );
    }

    return route.data;
  };

  return graphQLClient;
};

interface ServerlessClient {
  rest: ReturnType<typeof getRestClient>;
  graphql: ReturnType<typeof getGraphqlClient>;
}

export const getClient = () => {
  const client: ServerlessClient = {
    rest: () => {
      throw new Error('No REST configs found');
    },
    graphql: () => {
      throw new Error('No GraphQL configs found');
    }
  };

  if (config.rest) {
    client.rest = getRestClient();
  }
  if (config.graphql) {
    client.graphql = getGraphqlClient();
  }

  return client;
};
