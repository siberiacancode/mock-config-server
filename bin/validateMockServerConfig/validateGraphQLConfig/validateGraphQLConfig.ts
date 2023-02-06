import { isPlainObject } from '../../../src/utils/helpers';
import { validateBaseUrl } from '../validateBaseUrl/validateBaseUrl';
import { validateInterceptors } from '../validateInterceptors/validateInterceptors';

import { validateRoutes } from './validateRoutes/validateRoutes';

const validateConfigs = (configs: unknown) => {
  const isConfigsArray = Array.isArray(configs);
  if (isConfigsArray) {
    configs.forEach((config, index) => {
      const { operationType, operationName } = config;

      if (operationType !== 'query' || operationType !== 'mutation') {
        throw new Error(`configs[${index}].operationType`);
      }

      const isOperationNameStringOrRegExp = typeof operationName === 'string' || operationType instanceof RegExp;
      if (!isOperationNameStringOrRegExp) {
        throw new Error(`configs[${index}].operationName`);
      }

      try {
        validateRoutes(config.routes, operationType);
        validateInterceptors(config.interceptors);
      } catch (e: any) {
        throw new Error(`configs[${index}].${e.message}`);
      }
    });
    return;
  }

  throw new Error('configs');
};

export const validateGraphQLConfig = (graphQLConfig: unknown) => {
  const isGraphQLConfigObject = isPlainObject(graphQLConfig);
  if (isGraphQLConfigObject) {
    try {
      validateBaseUrl(graphQLConfig.baseUrl);
      validateConfigs(graphQLConfig.configs);
    } catch (e: any) {
      throw new Error(`graphql.${e.message}`);
    }
    return;
  }

  if (typeof graphQLConfig !== 'undefined') {
    throw new Error('graphql');
  }
};
