import { isPlainObject } from '../../src/utils/helpers';

import { validateBaseUrl } from './validateBaseUrl/validateBaseUrl';
import { validateCors } from './validateCors/validateCors';
import { validateInterceptors } from './validateInterceptors/validateInterceptors';
import { validatePort } from './validatePort/validatePort';
import { validateStaticPath } from './validateStaticPath/validateStaticPath';

export const validateMockServerConfig = (possibleConfig: unknown) => {
  if (!isPlainObject(possibleConfig)) {
    throw new Error(
      `configuration should be plain object; see our doc (https://www.npmjs.com/package/mock-config-server) for more information`
    );
  }

  validateBaseUrl(possibleConfig.baseUrl);
  validatePort(possibleConfig.port);
  validateStaticPath(possibleConfig.staticPath);
  validateInterceptors(possibleConfig.interceptors);
  validateCors(possibleConfig.cors);
};
