#!/usr/bin/env node

import { startGraphQLMockServer, startMockServer, startRestMockServer } from '@/server';
import type { GraphQLMockServerConfig, RestMockServerConfig } from '@/utils/types';

import type { MockServerConfig, MockServerConfigArgv } from '../src';

import { validateApiMockServerConfig } from './validateMockServerConfig/validateApiMockServerConfig';
import { validateMockServerConfig } from './validateMockServerConfig/validateMockServerConfig';

export const run = (mockConfig: MockServerConfig, argv: MockServerConfigArgv) => {
  try {
    const mergedMockServerConfig = { ...mockConfig, ...argv } as MockServerConfig;

    if (
      !mergedMockServerConfig.rest &&
      !mergedMockServerConfig.graphql &&
      'configs' in mergedMockServerConfig
    ) {
      const mergedApiMockServerConfig = mergedMockServerConfig as
        | RestMockServerConfig
        | GraphQLMockServerConfig;

      if (
        mergedApiMockServerConfig.configs?.at(0) &&
        'path' in mergedApiMockServerConfig.configs[0]
      ) {
        validateApiMockServerConfig(mergedApiMockServerConfig, 'rest');
        return startRestMockServer(mergedApiMockServerConfig as RestMockServerConfig);
      }

      if (
        mergedApiMockServerConfig.configs?.at(0) &&
        ('operationName' in mergedApiMockServerConfig.configs[0] ||
          'query' in mergedApiMockServerConfig.configs[0])
      ) {
        validateApiMockServerConfig(mergedApiMockServerConfig, 'graphql');
        return startGraphQLMockServer(mergedApiMockServerConfig as GraphQLMockServerConfig);
      }

      validateApiMockServerConfig(mergedApiMockServerConfig, 'rest');
      return startRestMockServer(mergedApiMockServerConfig as RestMockServerConfig);
    }

    validateMockServerConfig(mergedMockServerConfig);

    return startMockServer(mergedMockServerConfig);
  } catch (error: any) {
    console.error(error.message);
  }
};
