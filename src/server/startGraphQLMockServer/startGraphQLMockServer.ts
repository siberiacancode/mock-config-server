import color from 'ansi-colors';

import { destroyerMiddleware } from '@/core/middlewares';
import { DEFAULT } from '@/utils/constants';
import type { GraphQLMockServerConfig } from '@/utils/types';

import { createGraphQLMockServer } from '../createGraphQLMockServer/createGraphQLMockServer';

export const startGraphQLMockServer = (graphQLMockServerConfig: GraphQLMockServerConfig) => {
  const mockServer = createGraphQLMockServer(graphQLMockServerConfig);
  const port = graphQLMockServerConfig.port ?? DEFAULT.PORT;

  const server = mockServer.listen(port, () => {
    console.log(color.green(`🎉 GraphQL Mock Server is running at http://localhost:${port}`));
  });

  // ✅ important: add destroy method for closing keep-alive connections after server shutdown
  return destroyerMiddleware(server);
};
