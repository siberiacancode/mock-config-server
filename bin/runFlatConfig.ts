#!/usr/bin/env node

import { startFlatMockServer } from 'src/server/startFlatMockServer/startFlatMockServer';

import type { FlatMockServerConfig, MockServerConfigArgv } from '../src';

import { validateFlatMockServerComponents } from './validateMockServerConfig/validateFlatMockServerComponents';
import { validateFlatMockServerSettings } from './validateMockServerConfig/validateFlatMockServerSettings';

export const runFlatConfig = (
  flatMockServerConfig: FlatMockServerConfig,
  { baseUrl, port, staticPath }: MockServerConfigArgv
) => {
  try {
    const [option, ...flatMockServerComponents] = flatMockServerConfig;
    const isFlatMockServerSettingsExist = !('configs' in option);

    const mergedFlatMockServerConfig = [
      {
        ...(baseUrl && { baseUrl }),
        ...(port && { port }),
        ...(staticPath && { staticPath }),
        ...(isFlatMockServerSettingsExist && option)
      },
      ...(isFlatMockServerSettingsExist
        ? [option, ...flatMockServerComponents]
        : flatMockServerComponents)
    ] as FlatMockServerConfig;

    if (isFlatMockServerSettingsExist) {
      validateFlatMockServerSettings(option);
      validateFlatMockServerComponents(flatMockServerComponents);
    } else {
      validateFlatMockServerComponents([option, ...flatMockServerComponents]);
    }

    return startFlatMockServer(...mergedFlatMockServerConfig);
  } catch (error: any) {
    console.error(error.message);
  }
};
