import type { PlainObject } from '@/utils/types';

import { isPlainObject } from '../../../isPlainObject/isPlainObject';

type TokenObjectOptions = Record<string, boolean>;

type TokenObjectOptionsFiltering = 'whitelist' | 'blacklist';

const resolveTokenObjectOptionsFiltering = (
  tokenObjectOptions: TokenObjectOptions
): TokenObjectOptionsFiltering => {
  const values = Object.values(tokenObjectOptions);
  return values.some(Boolean) ? 'whitelist' : 'blacklist';
};

type TokenOptions = Record<string, boolean | TokenObjectOptions>;

export const filterTokenValues = (
  rawTokenValues: PlainObject,
  tokenOptions: TokenOptions
): PlainObject =>
  Object.entries(tokenOptions).reduce((acc, [tokenName, tokenOption]) => {
    const tokenValue = rawTokenValues[tokenName];

    if (tokenOption === true) {
      acc[tokenName] = tokenValue;
      return acc;
    }

    const isObjectOption = isPlainObject(tokenOption);
    if (isObjectOption) {
      const objectTokenOptions = tokenOption;
      const objectTokenValues = tokenValue;
      const tokenObjectOptionsFiltering = resolveTokenObjectOptionsFiltering(objectTokenOptions);

      if (tokenObjectOptionsFiltering === 'whitelist') {
        acc[tokenName] = Object.entries(objectTokenOptions).reduce(
          (acc, [objectTokenName, objectTokenOption]) => {
            if (objectTokenOption) {
              acc[objectTokenName] = objectTokenValues[objectTokenName];
            }
            return acc;
          },
          {} as PlainObject
        );
      }
      if (tokenObjectOptionsFiltering === 'blacklist') {
        acc[tokenName] = Object.keys(objectTokenValues).reduce((acc, objectTokenName) => {
          if (objectTokenOptions[objectTokenName] !== false) {
            acc[objectTokenName] = objectTokenValues[objectTokenName];
          }
          return acc;
        }, {} as PlainObject);
      }
    }

    return acc;
  }, {} as PlainObject);
