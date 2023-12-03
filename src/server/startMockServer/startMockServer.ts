import color from 'ansi-colors';

import { destroyerMiddleware } from '@/core/middlewares';
import { DEFAULT } from '@/utils/constants';
import type { MockServerConfig } from '@/utils/types';

import { createMockServer } from '../createMockServer/createMockServer';

export const startMockServer = (mockServerConfig: MockServerConfig) => {
  const mockServer = createMockServer(mockServerConfig);
  const port = mockServerConfig.port ?? DEFAULT.PORT;

  const server = mockServer.listen(port, () => {
    console.info(color.green(`🎉 Mock Server is running at http://localhost:${port}`));
  });

  // ✅ important: add destroy method for closing keep-alive connections after server shutdown
  return destroyerMiddleware(server);
};
