import { isPlainObject } from '../../src/utils/helpers';

import { validateBasePath } from './validateBasePath/validateBasePath';
import { validateCors } from './validateCors/validateCors';
import { validateInterceptors } from './validateInterceptors/validateInterceptors';
import { validateStaticPath } from './validateStaticPath/validateStaticPath';

export const validateMockServerConfig = (possibleConfig: any) => {
  if (!isPlainObject(possibleConfig)) {
    throw new Error(`configuration should be plain object; see our doc (https://www.npmjs.com/package/mock-config-server) for more information`);
  }

  validateBasePath(possibleConfig.baseUrl, possibleConfig.port);
  validateStaticPath(possibleConfig.staticPath);
  validateInterceptors(possibleConfig.interceptors);
  validateCors(possibleConfig.cors);
};
