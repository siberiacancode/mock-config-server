import type { Server } from 'http';
import type { Socket } from 'net';

import color from 'ansi-colors';

import { DEFAULT } from '@/utils/constants';
import type { MockServerConfig } from '@/utils/types';

import { createMockServer } from '../createMockServer/createMockServer';

export const startMockServer = (mockServerConfig: MockServerConfig) => {
  const mockServer = createMockServer(mockServerConfig);
  const port = mockServerConfig.port ?? DEFAULT.PORT;

  const instance = mockServer.listen(port, () => {
    console.log(color.green(`🎉 Mock Server is running at http://localhost:${port}`));
  });

  const connections: Record<string, Socket> = {};

  instance.on('connection', (connection) => {
    const key = `${connection.remoteAddress}:${connection.remotePort}`;
    connections[key] = connection;
    connection.on('close', () => {
      delete connections[key];
    });
  });

  const destroy: Server['close'] = (callback) => {
    instance.close(callback);
    Object.values(connections).forEach((connection) => {
      connection.destroy();
    })
    return instance;
  };

  return destroy;
};
