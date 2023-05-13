#!/usr/bin/env node

import { startMockServer } from '@/server';

import type { MockServerConfig, MockServerConfigArgv } from '../src';

import { validateMockServerConfig } from './validateMockServerConfig/validateMockServerConfig';

export const run = (mockConfig: MockServerConfig, argv: MockServerConfigArgv, ) => {
  try {
    const mergedMockServerConfig = { ...mockConfig, ...argv } as MockServerConfig;
    validateMockServerConfig(mergedMockServerConfig);

    return startMockServer(mergedMockServerConfig);
  } catch (error: any) {
    console.error(error.message);
  }
};
