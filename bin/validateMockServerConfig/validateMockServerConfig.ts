import { isPlainObject } from '@/utils/helpers';

import { validateBaseUrl } from './validateBaseUrl/validateBaseUrl';
import { validateCors } from './validateCors/validateCors';
import { validateGraphqlConfig } from './validateGraphqlConfig/validateGraphqlConfig';
import { validateInterceptors } from './validateInterceptors/validateInterceptors';
import { validatePort } from './validatePort/validatePort';
import { validateRestConfig } from './validateRestConfig/validateRestConfig';
import { validateStaticPath } from './validateStaticPath/validateStaticPath';

export const validateMockServerConfig = (mockServerConfig: unknown) => {
  if (!isPlainObject(mockServerConfig)) {
    throw new Error(
      'configuration should be plain object; see our doc (https://www.npmjs.com/package/mock-config-server) for more information'
    );
  }

  if (!mockServerConfig.rest && !mockServerConfig.graphql) {
    throw new Error(
      'configuration should contain at least one of these configs: rest | graphql; see our doc (https://www.npmjs.com/package/mock-config-server) for more information'
    );
  }

  try {
    if (mockServerConfig.rest) validateRestConfig(mockServerConfig.rest);
    if (mockServerConfig.graphql) validateGraphqlConfig(mockServerConfig.graphql);

    validateBaseUrl(mockServerConfig.baseUrl);
    validatePort(mockServerConfig.port);
    validateStaticPath(mockServerConfig.staticPath);
    validateInterceptors(mockServerConfig.interceptors);
    validateCors(mockServerConfig.cors);
  } catch (error: any) {
    throw new Error(
      `Validation Error: configuration.${error.message} does not match the API schema. Click here to see correct type: https://github.com/siberiacancode/mock-config-server`
    );
  }
};
