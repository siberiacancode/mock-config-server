import fs from 'fs';

import type { Plugin } from 'esbuild';
import { context } from 'esbuild';
import request from 'supertest';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import type { MockServerConfigArgv } from '../src';

import { start } from './start';

export const cli = async () => {
  const argv = yargs(hideBin(process.argv))
    .options({
      baseUrl: {
        alias: 'b',
        description: 'Set base url for mock server',
        type: 'string'
      },
      port: {
        alias: 'p',
        description: 'Set port for server',
        type: 'number'
      },
      staticPath: {
        alias: 's',
        description: 'Set static path for mock server',
        type: 'string'
      }
    })
    .version()
    .alias('version', 'v')
    .help()
    .alias('help', 'h')
    .parse();

  const appPath = process.cwd();

  const mockServerConfigFileRegex = /mock-server.config.(?:ts|js)/;
  const mockServerConfigFile = fs
    .readdirSync(appPath)
    .find((file) => mockServerConfigFileRegex.test(file));
  if (!mockServerConfigFile) {
    throw new Error('Cannot find config file mock-server.config.(ts|js)');
  }

  console.log('config file found:', mockServerConfigFile)

  let closesCount = 0;
  let startsCount = 0;
  let serv: Awaited<ReturnType<typeof start>>;

  const watchPlugin: Plugin = {
    name: 'watchPlugin',
    setup: (build) => {
      console.log('watchPlugin inited')

      build.onStart(() => {
        console.log('onStart')
        if (serv?.instance) {
          serv.instance.close()
          closesCount += 1;
          console.log('server closed', closesCount)
        }
      })

      build.onEnd(async (result) => {
        console.log(Date.now())
        console.log('build ended with', result.errors.length, 'errors')
        console.log('starting server')
        serv = await start(argv as MockServerConfigArgv);
        startsCount += 1;
        console.log('server started', startsCount)
        console.log('___________')
      })
    }
  }

  console.log('creating context...')
  const ctx = await context({
    entryPoints: [mockServerConfigFile],
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

  console.log('watching...')
  await ctx.watch();

  let requestCount = 0;
  setInterval(async () => {
    if (serv?.mockServer) {
      requestCount += 1;
      const response = await request(serv.mockServer).get('/api/rest/posts')
      console.log(`request ${requestCount}=`, response.body)
    }
  }, 1000)
};

/* use this config for test watch mode
const config: MockServerConfig = {
  baseUrl: '/api',
  rest: {
    baseUrl: '/rest',
    configs: [
      {
        path: '/posts',
        method: 'get',
        routes: [
          {
            data: () => {
              const date = new Date();
              const timestamp = `${(`0${date.getHours()}`).slice(-2)}:${(`0${date.getMinutes()}`).slice(-2)}:${(`0${date.getSeconds()}`).slice(-2)}`;
              const string = '22222'
              console.log('returned', timestamp, string)
              return string
            },
          }
        ]
      },
    ]
  }
}
*/
