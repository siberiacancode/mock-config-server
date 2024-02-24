#!/usr/bin/env node

import { startMockServer } from '@/server';

import type { MockServerConfig, MockServerConfigArgv } from '../src';

import { validateMockServerConfig } from './newValidateMockServerConfig/validateMockServerConfig';

export const run = (
  mockConfig: MockServerConfig,
  { baseUrl, port, staticPath }: MockServerConfigArgv
) => {
  try {
    const mergedMockServerConfig = { ...mockConfig, baseUrl, port, staticPath } as MockServerConfig;

    validateMockServerConfig(mergedMockServerConfig);

    return startMockServer(mergedMockServerConfig);
  } catch (error: any) {
    console.error(error.message);
  }
};
