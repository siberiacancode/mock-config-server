import { isPlainObject } from '@/utils/helpers';
import type { FlatMockServerConfig, MockServerConfig } from '@/utils/types';

import { resolveExportsFromSourceCode } from './resolveExportsFromSourceCode';

export const resolveConfigFile = (
  configSourceCode: string
): MockServerConfig | FlatMockServerConfig => {
  if (!configSourceCode) {
    throw new Error('Cannot handle source code of mock-server.config.(ts|js)');
  }

  const mockServerConfigExports = resolveExportsFromSourceCode(configSourceCode);

  const mockServerConfig: MockServerConfig | FlatMockServerConfig = mockServerConfigExports.default;

  if (!mockServerConfig) {
    throw new Error('Cannot handle exports of mock-server.config.(ts|js)');
  }

  if (!isPlainObject(mockServerConfig) && !Array.isArray(mockServerConfig)) {
    throw new Error(
      'configuration should be plain object or array; see our doc (https://www.npmjs.com/package/mock-config-server) for more information'
    );
  }
  return mockServerConfig;
};
