import color from 'ansi-colors';

import { DEFAULT } from '@/utils/constants';
import type { MockServerConfig } from '@/utils/types';

import { addDestroyer } from '../addDestroyer/addDestroyer';
import { createMockServer } from '../createMockServer/createMockServer';

export const startMockServer = (mockServerConfig: MockServerConfig) => {
  const mockServer = createMockServer(mockServerConfig);
  const port = mockServerConfig.port ?? DEFAULT.PORT;

  const instance = mockServer.listen(port, () => {
    console.log(color.green(`🎉 Mock Server is running at http://localhost:${port}`));
  });

  // ✅ important: add destroy method for closing keep-alive connections after server shutdown
  return addDestroyer(instance);
};
