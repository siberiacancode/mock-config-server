import type { FlatMockServerConfig } from 'mock-config-server';

import { createFlatMockServer, startFlatMockServer } from 'mock-config-server';

export const mockServerConfig: FlatMockServerConfig = [
  {
    configs: [
      {
        path: '/file',
        method: 'get',
        routes: [
          {
            // Will looking for file by "~/absolute/path/to/file" path
            file: '~/absolute/path/to/file'
          }
        ]
      }
    ]
  }
];

createFlatMockServer(mockServerConfig);
startFlatMockServer(mockServerConfig);
