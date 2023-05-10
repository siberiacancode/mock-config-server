#!/usr/bin/env node

import { build } from 'esbuild';

import { startMockServer } from '@/server';
import { isPlainObject } from '@/utils/helpers';

import type { MockServerConfigArgv, PlainObject } from '../src';

import { resolveConfigFilePath } from './resolveConfigFilePath/resolveConfigFilePath';
import { resolveExportsFromSourceCode } from './resolveExportsFromSourceCode/resolveExportsFromSourceCode';
import { validateMockServerConfig } from './validateMockServerConfig/validateMockServerConfig';

export const start = async (argv: MockServerConfigArgv) => {
  try {
    const configFilePath = resolveConfigFilePath(argv.config);
    if (!configFilePath) {
      throw new Error('Cannot find config file mock-server.config.(ts|mts|cts|js|mjs|cjs)');
    }

    const { outputFiles } = await build({
      entryPoints: [configFilePath],
      bundle: true,
      platform: 'node',
      target: 'esnext',
      minifySyntax: true,
      minify: true,
      write: false,
      metafile: false
    });

    const mockServerConfigSourceCode = outputFiles[0]?.text;
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
    startMockServer(mergedMockServerConfig);
  } catch (error: any) {
    console.error(error.message);
  }
};
