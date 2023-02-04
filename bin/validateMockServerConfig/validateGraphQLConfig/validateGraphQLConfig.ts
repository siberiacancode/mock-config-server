import { isPlainObject } from '../../../src/utils/helpers';
import { validateBaseUrl } from '../validateBaseUrl/validateBaseUrl';
import { validateInterceptors } from '../validateInterceptors/validateInterceptors';

import { validateRoutes } from './validateRoutes/validateRoutes';

const validateConfigs = (configs: unknown) => {
  const isConfigsArray = Array.isArray(configs);
  if (isConfigsArray) {
    configs.forEach((config) => {
      const { operationType, operationName } = config;

      if (operationType !== 'query' || operationType !== 'mutation') {
        throw new Error();
      }

      const isOperationNameStringOrRegExp = typeof operationName === 'string' || operationType instanceof RegExp;
      if (!isOperationNameStringOrRegExp) {
        throw new Error();
      }

      validateRoutes(config.routes, operationType);
      validateInterceptors(config.interceptors);
    });
    return;
  }

  throw new Error();
};

export const validateGraphQLConfig = (graphQLConfig: unknown) => {
  const isGraphQLConfigObject = isPlainObject(graphQLConfig);
  if (isGraphQLConfigObject) {
    validateBaseUrl(graphQLConfig.baseUrl);
    validateConfigs(graphQLConfig.configs);
    return;
  }

  if (typeof graphQLConfig !== 'undefined') {
    throw new Error();
  }
};
