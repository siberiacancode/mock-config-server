import type { RestMethod } from '../../../src';
import { isPlainObject } from '../../../src/utils/helpers';
import { validateBaseUrl } from '../validateBaseUrl/validateBaseUrl';
import { validateInterceptors } from '../validateInterceptors/validateInterceptors';

import { validateRoutes } from './validateRoutes/validateRoutes';

const validateConfigs = (configs: unknown) => {
  const isConfigsArray = Array.isArray(configs);
  if (isConfigsArray) {
    configs.forEach((config, index) => {
      const { path, method } = config;

      const isPathStringOrRegExp = typeof path === 'string' || path instanceof RegExp;
      if (!isPathStringOrRegExp) {
        throw new Error(`configs[${index}].path`);
      }

      // ✅ important:
      // compare without 'toLowerCase' because Express methods names is case-sensitive
      const allowedMethods = ['get', 'post', 'delete', 'put', 'patch'];
      const isMethodAllowed = typeof method === 'string' && allowedMethods.includes(method);
      if (!isMethodAllowed) {
        throw new Error(`configs[${index}].method`);
      }

      try {
        validateRoutes(config.routes, method as RestMethod);
        validateInterceptors(config.interceptors);
      } catch (e: any) {
        throw new Error(`configs[${index}].${e.message}`);
      }
    });
    return;
  }

  throw new Error('configs');
};

export const validateRestConfig = (restConfig: unknown) => {
  const isRestConfigObject = isPlainObject(restConfig);
  if (isRestConfigObject) {
    try {
      validateBaseUrl(restConfig.baseUrl);
      validateConfigs(restConfig.configs);
    } catch (e: any) {
      throw new Error(`rest.${e.message}`);
    }
    return;
  }

  if (typeof restConfig !== 'undefined') {
    throw new Error('rest');
  }
};
