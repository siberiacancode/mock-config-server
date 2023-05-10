import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import type { MockServerConfigArgv } from '../src';

import { start } from './start';

export const cli = () => {
  const argv = yargs(hideBin(process.argv))
    .usage('mcs [options]')
    .epilogue('More info: https://github.com/siberiacancode/mock-config-server#readme')
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
      },
      config: {
        alias: 'c',
        description: 'Set path to config file',
        type: 'string'
      }
    })
    .version()
    .alias('version', 'v')
    .help()
    .alias('help', 'h')
    .parse();

  start(argv as MockServerConfigArgv);
};
