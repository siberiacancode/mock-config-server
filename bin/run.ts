#!/usr/bin/env node

import { startGraphQLMockServer, startMockServer, startRestMockServer } from '@/server';
import { isPlainObject } from '@/utils/helpers';
import type { GraphQLMockServerConfig, RestMockServerConfig } from '@/utils/types';

import type { MockServerConfig, MockServerConfigArgv } from '../src';

import { validateApiMockServerConfig } from './validateMockServerConfig/validateApiMockServerConfig';
import { validateMockServerConfig } from './validateMockServerConfig/validateMockServerConfig';

export const run = (
  mockConfig: MockServerConfig,
  { baseUrl, port, staticPath }: MockServerConfigArgv
) => {
  console.warn(
    `**DEPRECATION WARNING**\nThe old mock config format is deprecated and will be removed in the next major version. Please use new format of config (flat config)`
  );

  try {
    const mergedMockServerConfig = {
      ...mockConfig,
      ...(baseUrl && { baseUrl }),
      ...(port && { port }),
      ...(staticPath && { staticPath })
    } as MockServerConfig;

    if (
      !mergedMockServerConfig.rest &&
      !mergedMockServerConfig.graphql &&
      'configs' in mergedMockServerConfig
    ) {
      const mergedApiMockServerConfig = mergedMockServerConfig as
        | RestMockServerConfig
        | GraphQLMockServerConfig;

      if (
        Array.isArray(mergedApiMockServerConfig.configs) &&
        isPlainObject(mergedApiMockServerConfig.configs[0]) &&
        'path' in mergedApiMockServerConfig.configs[0]
      ) {
        validateApiMockServerConfig(mergedApiMockServerConfig, 'rest');
        return startRestMockServer(mergedApiMockServerConfig as RestMockServerConfig);
      }

      if (
        Array.isArray(mergedApiMockServerConfig.configs) &&
        isPlainObject(mergedApiMockServerConfig.configs[0]) &&
        ('query' in mergedApiMockServerConfig.configs[0] ||
          'operationName' in mergedApiMockServerConfig.configs[0])
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
