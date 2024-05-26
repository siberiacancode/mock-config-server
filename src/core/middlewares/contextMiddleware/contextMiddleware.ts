import type { Express } from 'express';

import { createOrm, createStorage } from '@/core/database';
import type { MockServerConfig } from '@/utils/types';

export const contextMiddleware = (
  server: Express,
  { database }: Pick<MockServerConfig, 'database'>
) => {
  const context: Express['request']['context'] = { orm: {} };
  if (database) {
    const storage = createStorage(database.data);
    const orm = createOrm(storage);

    context.orm = orm;
  }

  server.use((request, _response, next) => {
    request.context = context;
    next();
  });
};
