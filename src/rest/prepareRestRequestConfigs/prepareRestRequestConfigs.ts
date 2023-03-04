import { isPlainObject } from '../../utils/helpers';
import type { RestMethod, RestRequestConfig, RestRouteConfig } from '../../utils/types';

const calculateRouteConfigWeight = (restRouteConfig: RestRouteConfig<RestMethod>) => {
  const { entities } = restRouteConfig;
  if (!entities) return 0;

  let routeConfigWeight = 0;
  const { headers, query, params, body } = entities;
  if (headers) routeConfigWeight += Object.keys(headers).length;
  if (query) routeConfigWeight += Object.keys(query).length;
  if (params) routeConfigWeight += Object.keys(params).length;
  if (body) routeConfigWeight += isPlainObject(body) ? Object.keys(body).length : 1;

  return routeConfigWeight;
};

export const prepareRestRequestConfigs = (requestConfigs: RestRequestConfig[]) => {
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
