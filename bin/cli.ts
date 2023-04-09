import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import type { MockServerConfigArgv } from '../src';

import { start } from './mock-config-server';

export const parseCli = () => {
  const argv = yargs(hideBin(process.argv))
    .options({
      baseurl: {
        alias: 'b',
        description: 'Set base url for mock server',
        type: 'string'
      },
      port: {
        alias: 'p',
        description: 'Set port for server',
        type: 'number'
      },
      static: {
        alias: 's',
        description: 'Set static url for mock server',
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
