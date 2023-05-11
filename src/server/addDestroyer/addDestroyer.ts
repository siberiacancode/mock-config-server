import type { Server } from 'http';
import type { Socket } from 'net';

type ServerWithDestroyer = Server & { destroy: Server['close'] };

export const addDestroyer = (serverInstance: Server): ServerWithDestroyer => {
  const instanceWithDestroyer = serverInstance as ServerWithDestroyer;
  const connections: Record<string, Socket> = {};

  instanceWithDestroyer.on('connection', (connection) => {
    const key = `${connection.remoteAddress}:${connection.remotePort}`;
    connections[key] = connection;
    connection.on('close', () => {
      delete connections[key];
    });
  });

  instanceWithDestroyer.destroy = (callback) => {
    serverInstance.close(callback);
    Object.values(connections).forEach((connection) => {
      connection.destroy();
    })
    return serverInstance;
  };

  return instanceWithDestroyer;
}
