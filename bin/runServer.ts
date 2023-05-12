#!/usr/bin/env node

import type { OutputFile } from 'esbuild';

import { startMockServer } from '@/server';
import { isPlainObject } from '@/utils/helpers';

import type { MockServerConfigArgv, PlainObject } from '../src';

import { resolveExportsFromSourceCode } from './resolveExportsFromSourceCode/resolveExportsFromSourceCode';
import { validateMockServerConfig } from './validateMockServerConfig/validateMockServerConfig';

export const runServer = (argv: MockServerConfigArgv, mockConfig: OutputFile) => {
  try {
    const mockServerConfigSourceCode = mockConfig?.text;
    if (!mockServerConfigSourceCode) {
      throw new Error('Cannot handle source code of mock-server.config.(ts|js)');
    }

    const mockServerConfigExports = resolveExportsFromSourceCode(mockServerConfigSourceCode);
    if (!mockServerConfigExports?.default) {
      throw new Error('Cannot handle exports of mock-server.config.(ts|js)');
    }

    if (!isPlainObject(mockServerConfigExports.default)) {
      throw new Error(
        'configuration should be plain object; see our doc (https://www.npmjs.com/package/mock-config-server) for more information'
      );
    }

    const mergedMockServerConfig = { ...mockServerConfigExports.default, ...argv } as PlainObject;
    validateMockServerConfig(mergedMockServerConfig);

    return startMockServer(mergedMockServerConfig);
  } catch (error: any) {
    console.error(error.message);
  }
};
