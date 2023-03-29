#!/usr/bin/env node

import * as fs from 'fs';

import { build } from 'esbuild';

import { startMockServer } from '@/server';

import { resolveExportsFromSourceCode } from './resolveExportsFromSourceCode';
import { validateMockServerConfig } from './validateMockServerConfig/validateMockServerConfig';

console.log('@');
const start = async () => {
  try {
    const appPath = process.cwd();

    const mockServerConfigFileRegex = /mock-server.config.(?:ts|js)/;
    const mockServerConfigFile = fs
      .readdirSync(appPath)
      .find((file) => mockServerConfigFileRegex.test(file));
    if (!mockServerConfigFile) {
      throw new Error('Cannot find config file mock-server.config.(ts|js)');
    }

    const { outputFiles } = await build({
      entryPoints: [mockServerConfigFile],
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

    validateMockServerConfig(mockServerConfigExports.default);
    startMockServer(mockServerConfigExports.default);
  } catch (error: any) {
    console.error(error.message);
  }
};

start();
