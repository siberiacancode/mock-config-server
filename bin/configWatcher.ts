import type { BuildOptions, Plugin } from 'esbuild';
import { build, context } from 'esbuild';

import type { MockServerConfigArgv } from '@/utils/types';

import { resolveConfigFilePath } from './resolveConfigFilePath/resolveConfigFilePath';
import { start } from './start';

export const configWatcher = async (argv: MockServerConfigArgv) => {
  const configFilePath = resolveConfigFilePath(argv.config);
  if (!configFilePath) {
    throw new Error('Cannot find config file mock-server.config.(ts|mts|cts|js|mjs|cjs)');
  }

  const buildOptions = {
    entryPoints: [configFilePath],
    bundle: true,
    platform: 'node',
    target: 'esnext',
    minifySyntax: true,
    minify: true,
    write: false,
    metafile: false,
    logLevel: 'info',
    plugins: [] as Plugin[]
  } satisfies BuildOptions;

  if (argv.watch) {
    const watchPlugin: Plugin = {
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
    }

    buildOptions.plugins.push(watchPlugin);

    const ctx = await context(buildOptions);

    ctx.watch();
    return;
  }
  
  const { outputFiles } = await build(buildOptions);
  start(argv, outputFiles ?? []);
}
