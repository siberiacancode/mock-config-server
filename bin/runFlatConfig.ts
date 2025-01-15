#!/usr/bin/env node

import { startFlatMockServer } from '@/server';

import type { FlatMockServerConfig, FlatMockServerSettings, MockServerConfigArgv } from '../src';

export const runFlatConfig = (
  flatMockServerConfig: FlatMockServerConfig,
  { baseUrl, port, staticPath }: MockServerConfigArgv
) => {
  try {
    const [option, ...flatMockServerComponents] = flatMockServerConfig;
    const flatMockServerSettings = !('configs' in option) ? option : undefined;

    const mergedFlatMockServerConfig = (
      flatMockServerSettings ? flatMockServerComponents : flatMockServerConfig
    ) as FlatMockServerConfig;
    if (flatMockServerSettings) {
      mergedFlatMockServerConfig.unshift({
        ...flatMockServerSettings,
        ...(baseUrl && { baseUrl }),
        ...(port && { port }),
        ...(staticPath && { staticPath })
      } as FlatMockServerSettings);
    }

    return startFlatMockServer(mergedFlatMockServerConfig);
  } catch (error: any) {
    console.error(error.message);
  }
};
