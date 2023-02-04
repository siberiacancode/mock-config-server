import type { RestMethod } from '../../../src';
import { isPlainObject } from '../../../src/utils/helpers';
import { validateBaseUrl } from '../validateBaseUrl/validateBaseUrl';
import { validateInterceptors } from '../validateInterceptors/validateInterceptors';

import { validateRoutes } from './validateRoutes/validateRoutes';

const validateConfigs = (configs: unknown) => {
  const isConfigsArray = Array.isArray(configs);
  if (isConfigsArray) {
    configs.forEach((config) => {
      const { path, method } = config;

      const isPathStringOrRegExp = typeof path === 'string' || path instanceof RegExp;
      if (!isPathStringOrRegExp) {
        throw new Error();
      }

      const allowedMethods = ['get', 'post', 'delete', 'put', 'patch'];
      const isMethodAllowed = typeof method === 'string' && allowedMethods.includes(method);
      if (!isMethodAllowed) {
        throw new Error();
      }

      validateRoutes(config.routes, method as RestMethod);
      validateInterceptors(config.interceptors);
    });
    return;
  }

  throw new Error();
}

export const validateRestConfig = (restConfig: unknown) => {
  const isRestConfigObject = isPlainObject(restConfig);
  if (isRestConfigObject) {
    validateBaseUrl(restConfig.baseUrl);
    validateConfigs(restConfig.configs);
    return;
  }

  if (typeof restConfig !== 'undefined') {
    throw new Error();
  }
};
