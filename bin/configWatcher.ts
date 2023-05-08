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

  let server: Awaited<ReturnType<typeof start>>;

  const watchPlugin: Plugin = {
    name: 'watchPlugin',
    setup: (build) => {
      build.onStart(() => {
        server?.close();
      })

      build.onEnd((result) => {
        if (!result.errors.length) {
          server = start(argv, result.outputFiles ?? []);
        }
      })
    }
  }

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
    plugins: [watchPlugin]
  });

  await ctx.watch();
}
