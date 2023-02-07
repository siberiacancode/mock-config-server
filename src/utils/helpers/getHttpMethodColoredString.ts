import color from 'ansi-colors';

import type { RestMethod } from '../types';

export const getHttpMethodColoredString = (httpMethod: RestMethod) => {
  const method = httpMethod.toUpperCase();
  if (httpMethod === 'get') return color.blueBright(method);
  if (httpMethod === 'post') return color.greenBright(method);
  if (httpMethod === 'put') return color.yellowBright(method);
  if (httpMethod === 'patch') return color.cyan(method);
  if (httpMethod === 'delete') return color.red(method);
};
