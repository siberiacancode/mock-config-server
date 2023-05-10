import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import type { MockServerConfigArgv } from '../src';

import { configWatcher } from './configWatcher';

export const cli = () => {
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
      },
      config: {
        alias: 'c',
        description: 'Set path to config file',
        type: 'string'
      },
      noWatch: {
        alias: 'nw',
        description: 'Disables server restart after config file changes',
        type: 'boolean',
        default: false
      }
    })
    .version()
    .alias('version', 'v')
    .help()
    .alias('help', 'h')
    .parse() as MockServerConfigArgv;

  configWatcher(argv);
}
