import type { PlainObject } from '../../src';

import { validateBaseUrl } from './validateBaseUrl/validateBaseUrl';
import { validateCors } from './validateCors/validateCors';
import { validateDatabaseConfig } from './validateDatabaseConfig/validateDatabaseConfig';
import { validateGraphqlConfig } from './validateGraphqlConfig/validateGraphqlConfig';
import { validateInterceptors } from './validateInterceptors/validateInterceptors';
import { validatePort } from './validatePort/validatePort';
import { validateRestConfig } from './validateRestConfig/validateRestConfig';
import { validateStaticPath } from './validateStaticPath/validateStaticPath';

export const validateApiMockServerConfig = (
  mockServerConfig: PlainObject,
  api: 'graphql' | 'rest'
) => {
  if (!mockServerConfig.configs && !mockServerConfig.database && !mockServerConfig.staticPath) {
    throw new Error(
      'configuration should contain at least one of these configs: configs | database | staticPath; see our doc (https://www.npmjs.com/package/mock-config-server) for more information'
    );
  }

  try {
    if (Array.isArray(mockServerConfig.configs) && mockServerConfig.configs?.at(0)) {
      if (api === 'rest') {
        validateRestConfig({ configs: mockServerConfig.configs });
      }

      if (api === 'graphql') {
        validateGraphqlConfig({
          configs: mockServerConfig.configs
        });
      }
    }

    if (mockServerConfig.database) validateDatabaseConfig(mockServerConfig.database);

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
