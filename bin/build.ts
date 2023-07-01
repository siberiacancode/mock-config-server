import type { BuildOptions, Plugin } from 'esbuild';
import { build as esBuild, context } from 'esbuild';

import type { MockServerConfigArgv } from '@/utils/types';

import { resolveConfigFile, resolveConfigFilePath } from './helpers';
import { run } from './run';

export const build = async (argv: MockServerConfigArgv) => {
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
        let instance: Awaited<ReturnType<typeof run>>;

        build.onStart(() => {
          instance?.destroy();
        });

        build.onEnd((result) => {
          if (!result.errors.length) {
            const mockConfig = resolveConfigFile(result.outputFiles![0].text);
            instance = run(mockConfig, argv);
          }
        });
      }
    };

    buildOptions.plugins.push(watchPlugin);

    const ctx = await context(buildOptions);

    ctx.watch();
    return;
  }

  const { outputFiles } = await esBuild(buildOptions);

  const mockConfig = resolveConfigFile(outputFiles[0].text);
  run(mockConfig, argv);
};
