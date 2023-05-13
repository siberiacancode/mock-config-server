import { isPlainObject } from '@/utils/helpers';

import { resolveExportsFromSourceCode } from '../resolveExportsFromSourceCode/resolveExportsFromSourceCode';

export const resolveConfigFile = (configSourceCode: string) => {
  if (!configSourceCode) {
    throw new Error('Cannot handle source code of mock-server.config.(ts|js)');
  }

  const mockServerConfigExports = resolveExportsFromSourceCode(configSourceCode);

  const mockServerConfig = mockServerConfigExports.default;

  if (!mockServerConfig) {
    throw new Error('Cannot handle exports of mock-server.config.(ts|js)');
  }

  if (!isPlainObject(mockServerConfig)) {
    throw new Error(
      'configuration should be plain object; see our doc (https://www.npmjs.com/package/mock-config-server) for more information'
    );
  }
  return mockServerConfig;
};
