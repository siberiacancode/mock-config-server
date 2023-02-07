#!/usr/bin/env node

import { build } from 'esbuild';
import * as fs from 'fs';

import { startMockServer } from '../src';

import { resolveExportsFromSourceCode } from './resolveExportsFromSourceCode';

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
    startMockServer(mockServerConfigExports.default);
  } catch (e: any) {
    console.error(e.message);
  }
};

start();
