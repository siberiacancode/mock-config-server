import { isPlainObject } from '../../utils/helpers';
import type { GraphQLRequestConfig, GraphQLRouteConfig } from '../../utils/types';

const calculateRouteConfigWeight = (graphQLRouteConfig: GraphQLRouteConfig) => {
  const { entities } = graphQLRouteConfig;
  if (!entities) return 0;

  let routeConfigWeight = 0;
  const { headers, query, variables } = entities;
  if (headers) routeConfigWeight += Object.keys(headers).length;
  if (query) routeConfigWeight += Object.keys(query).length;
  if (variables) routeConfigWeight += isPlainObject(variables) ? Object.keys(variables).length : 1;

  return routeConfigWeight;
};

export const prepareGraphQLRequestConfigs = (requestConfigs: GraphQLRequestConfig[]) => {
  requestConfigs.forEach((requestConfig) => {
    requestConfig.routes.sort(
      (first, second) =>
        // ✅ important:
        // Lift more specific configs for correct working of routes
        calculateRouteConfigWeight(second) - calculateRouteConfigWeight(first)
    );
  });
  return requestConfigs;
};
