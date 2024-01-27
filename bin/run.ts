#!/usr/bin/env node

import { startMockServer } from '@/server';

import type { MockServerConfig, MockServerConfigArgv } from '../src';

import { validateMockServerConfig } from './newValidateMockServerConfig/validateMockServerConfig';

export const run = (mockConfig: MockServerConfig, argv: MockServerConfigArgv) => {
  try {
    const { baseUrl, port, staticPath } = argv;
    const mergedMockServerConfig = { ...mockConfig, baseUrl, port, staticPath } as MockServerConfig;

    validateMockServerConfig(mergedMockServerConfig);

    return startMockServer(mergedMockServerConfig);
  } catch (error: any) {
    console.error(error.message);
  }
};
