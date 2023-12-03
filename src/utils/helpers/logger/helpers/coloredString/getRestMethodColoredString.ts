import c from 'ansi-colors';

import type { RestMethod } from '@/utils/types';

export const getRestMethodColoredString = (restMethod: RestMethod) => {
  if (restMethod === 'get') return c.white(restMethod);
  if (restMethod === 'post') return c.green(restMethod);
  if (restMethod === 'put') return c.yellow(restMethod);
  if (restMethod === 'patch') return c.red(restMethod);
  if (restMethod === 'delete') return c.redBright(restMethod);
  if (restMethod === 'options') return c.redBright(restMethod);
  throw new Error('Wrong restMethod');
};
