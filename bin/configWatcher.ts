import type { Plugin } from 'esbuild';
import { context } from 'esbuild';

import type { MockServerConfigArgv } from '@/utils/types';

import { resolveConfigFilePath } from './resolveConfigFilePath/resolveConfigFilePath';
import { start } from './start';

export const configWatcher = async (argv: MockServerConfigArgv) => {
  const configFilePath = resolveConfigFilePath(argv.config);
  if (!configFilePath) {
    throw new Error('Cannot find config file mock-server.config.(ts|mts|cts|js|mjs|cjs)');
  }

  const plugins: Plugin[] = [];

  if (!argv.noWatch) plugins.push({
    name: 'watch',
    setup: (build) => {
      let instance: Awaited<ReturnType<typeof start>>;

      build.onStart(() => {
        instance?.destroy();
      })

      build.onEnd((result) => {
        if (!result.errors.length) {
          instance = start(argv, result.outputFiles ?? []);
        }
      })
    }
  });

  const ctx = await context({
    entryPoints: [configFilePath],
    bundle: true,
    platform: 'node',
    target: 'esnext',
    minifySyntax: true,
    minify: true,
    write: false,
    metafile: false,
    logLevel: 'info',
    plugins
  });

  if (!argv.noWatch) {
    ctx.watch();
    return;
  }
  const { outputFiles } = await ctx.rebuild();
  start(argv, outputFiles ?? []);
}
