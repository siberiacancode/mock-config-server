import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { DEFAULT } from '@/utils/constants';

import type { MockServerConfigArgv } from '../src';

import { start } from './start';

export const cli = () => {
  const argv = yargs(hideBin(process.argv))
    .options({
      baseUrl: {
        alias: 'b',
        description: 'Set base url for mock server',
        type: 'string',
        default: '/'
      },
      port: {
        alias: 'p',
        description: 'Set port for server',
        type: 'number',
        default: DEFAULT.PORT
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
      },
      watch: {
        alias: 'w',
        description: 'Enables server restart after config file changes',
        type: 'boolean',
        default: false
      }
    })
    .version()
    .alias('version', 'v')
    .help()
    .alias('help', 'h')
    .parse() as MockServerConfigArgv;

  start(argv);
}
