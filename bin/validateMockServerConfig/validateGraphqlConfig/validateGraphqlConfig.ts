import { isPlainObject } from '@/utils/helpers';

import { validateBaseUrl } from '../validateBaseUrl/validateBaseUrl';
import { validateInterceptors } from '../validateInterceptors/validateInterceptors';

import { validateRoutes } from './validateRoutes/validateRoutes';

const validateConfigs = (configs: unknown) => {
  const isConfigsArray = Array.isArray(configs);
  if (isConfigsArray) {
    configs.forEach((config, index) => {
      const { operationType, operationName, query } = config;

      if (typeof operationName === 'undefined' && typeof query === 'undefined') {
        throw new Error(`configs[${index}]`);
      }

      if (operationType !== 'query' && operationType !== 'mutation') {
        throw new Error(`configs[${index}].operationType`);
      }

      if (
        typeof operationName !== 'undefined' &&
        typeof operationName !== 'string' &&
        !(operationName instanceof RegExp)
      ) {
        throw new Error(`configs[${index}].operationName`);
      }

      if (typeof query !== 'undefined' && typeof query !== 'string') {
        throw new Error(`configs[${index}].query`);
      }

      try {
        validateRoutes(config.routes, operationType);
        validateInterceptors(config.interceptors);
      } catch (error: any) {
        throw new Error(`configs[${index}].${error.message}`);
      }
    });
    return;
  }

  throw new Error('configs');
};

export const validateGraphqlConfig = (graphqlConfig: unknown) => {
  const isGraphqlConfigObject = isPlainObject(graphqlConfig);
  if (isGraphqlConfigObject) {
    try {
      validateBaseUrl(graphqlConfig.baseUrl);
      validateConfigs(graphqlConfig.configs);
    } catch (error: any) {
      throw new Error(`graphql.${error.message}`);
    }
    return;
  }

  if (typeof graphqlConfig !== 'undefined') {
    throw new Error('graphql');
  }
};
