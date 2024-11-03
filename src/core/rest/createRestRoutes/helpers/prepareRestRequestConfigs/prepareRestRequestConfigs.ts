import { isPlainObject } from '@/utils/helpers';
import type { RestMethod, RestRequestConfig, RestRouteConfig } from '@/utils/types';

const calculateRouteConfigWeight = (restRouteConfig: RestRouteConfig<RestMethod>) => {
  const { entities } = restRouteConfig;
  if (!entities) return 0;

  let routeConfigWeight = 0;
  const { headers, cookies, query, params, body } = entities;

  if (headers) routeConfigWeight += Object.keys(headers).length;
  if (cookies) routeConfigWeight += Object.keys(cookies).length;
  if (query) routeConfigWeight += Object.keys(query).length;
  if (params) routeConfigWeight += Object.keys(params).length;
  if (body) {
    if (isPlainObject(body) && body.checkMode) {
      // ✅ important:
      // check that actual value check modes does not have `value` for compare
      if (body.checkMode === 'exists' || body.checkMode === 'notExists') {
        routeConfigWeight += 1;
        return routeConfigWeight;
      }
      routeConfigWeight += isPlainObject(body.value) ? Object.keys(body.value).length : 1;
      return routeConfigWeight;
    }
    routeConfigWeight += isPlainObject(body) ? Object.keys(body).length : 1;
  }

  return routeConfigWeight;
};

export const prepareRestRequestConfigs = (requestConfigs: RestRequestConfig[]) => {
  const sortedByPathRequestConfigs = requestConfigs.sort(({ path: first }, { path: second }) => {
    // ✅ important:
    // do not affect RegExp paths and paths without parameters
    if (first instanceof RegExp || second instanceof RegExp) return 0;
    if (!first.includes('/:') && !second.includes('/:')) return 0;

    // ✅ important:
    // remove trailing slashes because they can affect 'split' method result
    const firstRouteSegments = first.replace(/\/$/, '').split('/');
    const secondRouteSegments = second.replace(/\/$/, '').split('/');

    for (let i = 0; i < Math.min(firstRouteSegments.length, secondRouteSegments.length); i += 1) {
      const firstRouteSegment = firstRouteSegments[i];
      const secondRouteSegment = secondRouteSegments[i];

      const isFirstRouteSegmentParameterized = firstRouteSegment.startsWith(':');
      const isSecondRouteSegmentParameterized = secondRouteSegment.startsWith(':');

      if (!isFirstRouteSegmentParameterized && !isSecondRouteSegmentParameterized) {
        // ✅ important:
        // urls are different in the constant parts => no need to sort them
        // eslint-disable-next-line no-continue
        if (firstRouteSegment === secondRouteSegment) continue;
        return 0;
      }

      // ✅ important:
      // urls are both parameterized => continue to search parameterized and not parameterized pair
      // eslint-disable-next-line no-continue
      if (isFirstRouteSegmentParameterized && isSecondRouteSegmentParameterized) continue;

      // ✅ important:
      // some route segment is parameterized and another one is not
      // not parameterized one should be first in array of request configs
      return +isFirstRouteSegmentParameterized - +isSecondRouteSegmentParameterized;
    }
    return 0;
  });

  sortedByPathRequestConfigs.forEach((requestConfig) => {
    requestConfig.routes.sort(
      (first, second) =>
        // ✅ important:
        // Lift more specific configs for correct working of routes
        calculateRouteConfigWeight(second) - calculateRouteConfigWeight(first)
    );
  });
  return requestConfigs;
};
