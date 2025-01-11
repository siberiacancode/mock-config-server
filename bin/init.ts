import color from 'ansi-colors';
import prompts from 'prompts';

import type { MockServerConfigArgv } from '@/utils/types';
import { baseUrlSchema, portSchema, staticPathSchema } from '@/utils/validate';

import { createTemplate } from './helpers';

export const init = async (argv: MockServerConfigArgv) => {
  try {
    const response = await prompts(
      [
        {
          name: 'withTypescript',
          type: 'toggle',
          message: 'Would you like to use TypeScript?',
          initial: true,
          active: 'Yes',
          inactive: 'No'
        },
        {
          type: 'select',
          name: 'apiType',
          message: 'Choose api type',
          initial: 0,
          choices: [
            { title: 'Rest', description: 'Rest api sample', value: 'rest' },
            { title: 'GraphQL', description: 'GraphQL api sample', value: 'graphql' },
            { title: 'Both', description: 'Rest api and GraphQL api sample', value: 'full' }
          ]
        },
        {
          name: 'baseUrl',
          type: argv.baseUrl ? null : 'text',
          message: 'Base url (must start with a forward slash):',
          initial: '/',
          validate: (baseUrl) => {
            try {
              baseUrlSchema.parse(baseUrl);
              return true;
            } catch {
              return 'Invalid base url value';
            }
          }
        },
        {
          name: 'port',
          type: argv.port ? null : 'number',
          message: 'Port:',
          initial: 31299,
          validate: (port) => {
            try {
              portSchema.parse(+port);
              return true;
            } catch (error: any) {
              return 'Invalid port value';
            }
          }
        },
        {
          name: 'staticPath',
          type: argv.staticPath ? null : 'text',
          message: 'Static path (must start with a forward slash):',
          initial: '/',
          validate: (staticPath) => {
            try {
              staticPathSchema.parse(staticPath);
              return true;
            } catch {
              return 'Invalid static path value';
            }
          }
        }
      ],
      {
        onCancel: () => {
          throw new Error('❌ Operation cancelled');
        }
      }
    );

    await createTemplate({ ...argv, ...response });
    const userAgent = process.env.npm_config_user_agent ?? '';
    // eslint-disable-next-line no-nested-ternary
    const packageManager = /pnpm/.test(userAgent)
      ? 'pnpm'
      : /yarn/.test(userAgent)
        ? 'yarn'
        : 'npx';

    console.log('\n');
    console.log(color.bold('🎉 Thanks for using mock-config-server! 🎉'));
    console.log(`start command: ${color.bold(color.green(`${packageManager} mcs`))}`);
  } catch (cancelled: any) {
    console.log(cancelled?.message);
    process.exit(1);
  }
};
