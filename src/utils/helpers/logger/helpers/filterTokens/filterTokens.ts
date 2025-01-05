import type { PlainObject } from '@/utils/types';

import { isPlainObject } from '../../../isPlainObject/isPlainObject';

type TokenObjectOptions = Record<string, boolean>;

type TokenObjectOptionsFilterMode = 'whitelist' | 'blacklist';

const resolveTokenObjectOptionsFilterMode = (
  tokenObjectOptions: TokenObjectOptions
): TokenObjectOptionsFilterMode => {
  const values = Object.values(tokenObjectOptions);
  return values.some(Boolean) ? 'whitelist' : 'blacklist';
};

type TokenOptions = Record<string, boolean | TokenObjectOptions>;

export const filterTokens = (tokens: PlainObject, options: TokenOptions): PlainObject =>
  Object.entries(options).reduce((acc, [name, option]) => {
    const token = tokens[name];

    if (option === true) {
      acc[name] = token;
      return acc;
    }

    const isObjectOption = isPlainObject(option);
    const isObjectToken = isPlainObject(token);
    if (isObjectOption && isObjectToken) {
      const tokenObjectOptionsFilterMode = resolveTokenObjectOptionsFilterMode(option);

      if (tokenObjectOptionsFilterMode === 'whitelist') {
        acc[name] = Object.entries(option).reduce((acc, [name, objectTokenOption]) => {
          if (objectTokenOption) {
            acc[name] = token[name];
          }
          return acc;
        }, {} as PlainObject);
      }
      if (tokenObjectOptionsFilterMode === 'blacklist') {
        acc[name] = Object.keys(token).reduce((acc, name) => {
          if (option[name] !== false) {
            acc[name] = token[name];
          }
          return acc;
        }, {} as PlainObject);
      }
    }

    return acc;
  }, {} as PlainObject);
