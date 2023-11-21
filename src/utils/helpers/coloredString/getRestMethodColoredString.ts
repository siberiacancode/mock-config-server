import c from 'ansi-colors';

import type { RestMethod } from '@/utils/types';

export const getRestMethodColoredString = (restMethod: RestMethod) => {
  if (restMethod.toLowerCase() === 'get') return c.white(restMethod);
  if (restMethod.toLowerCase() === 'post') return c.green(restMethod);
  if (restMethod.toLowerCase() === 'put') return c.yellow(restMethod);
  if (restMethod.toLowerCase() === 'patch') return c.red(restMethod);
  if (restMethod.toLowerCase() === 'delete') return c.redBright(restMethod);
  if (restMethod.toLowerCase() === 'options') return c.redBright(restMethod);
  throw new Error('Wrong restMethod');
};
