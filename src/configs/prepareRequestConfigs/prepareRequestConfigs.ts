import { isPlainObject } from '../../utils/helpers';
import type { RequestConfig, RestMethod, RouteConfig } from '../../utils/types';

const calculateRouteConfigWeight = (routeConfig: RouteConfig<RestMethod>) => {
  const { entities } = routeConfig;
  if (!entities) return 0;

  let routeConfigWeight = 0;
  const { headers, query, params, body } = entities;
  if (headers) routeConfigWeight += Object.keys(headers).length;
  if (query) routeConfigWeight += Object.keys(query).length;
  if (params) routeConfigWeight += Object.keys(params).length;
  if (body) routeConfigWeight += isPlainObject(body) ? Object.keys(body).length : 1;

  return routeConfigWeight;
};

export const prepareRequestConfigs = (requestConfigs: RequestConfig[]) => {
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
