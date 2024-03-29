import { isPlainObject } from '@/utils/helpers';
import type { RestMethod } from '@/utils/types';

import { validateBaseUrl } from '../validateBaseUrl/validateBaseUrl';
import { validateInterceptors } from '../validateInterceptors/validateInterceptors';

import { validateRoutes } from './validateRoutes/validateRoutes';

const validateConfigs = (configs: unknown) => {
  const isConfigsArray = Array.isArray(configs);
  if (isConfigsArray) {
    configs.forEach((config, index) => {
      const { path, method } = config;

      const isPathStringWithLeadingSlash = typeof path === 'string' && path.startsWith('/');
      if (!isPathStringWithLeadingSlash && !(path instanceof RegExp)) {
        throw new Error(`configs[${index}].path`);
      }

      // ✅ important:
      // compare without 'toLowerCase' because Express methods names is case-sensitive
      const allowedMethods = ['get', 'post', 'delete', 'put', 'patch', 'options'];
      const isMethodAllowed = typeof method === 'string' && allowedMethods.includes(method);
      if (!isMethodAllowed) {
        throw new Error(`configs[${index}].method`);
      }

      try {
        validateRoutes(config.routes, method as RestMethod);
        validateInterceptors(config.interceptors);
      } catch (error: any) {
        throw new Error(`configs[${index}].${error.message}`);
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
    } catch (error: any) {
      throw new Error(`rest.${error.message}`);
    }
    return;
  }

  if (typeof restConfig !== 'undefined') {
    throw new Error('rest');
  }
};
