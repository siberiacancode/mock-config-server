import { unflatten } from 'flat';

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

const getByFlattenKey = (obj: unknown, key: string) => {
  const keys = key.split('.');

  return keys.reduce((acc, key) => {
    if (isPlainObject(acc) || Array.isArray(acc)) {
      // @ts-ignore
      return acc[key];
    }
    return acc;
  }, obj);
};

export const filterTokens = (tokens: PlainObject, options: TokenOptions): PlainObject =>
  unflatten(
    Object.entries(options).reduce((acc, [tokenName, tokenOption]) => {
      const tokenValue = tokens[tokenName];

      if (tokenOption === true) {
        acc[tokenName] = tokenValue;
        return acc;
      }

      const isObjectOption = isPlainObject(tokenOption);
      if (isObjectOption) {
        const objectTokenOptions = tokenOption;
        const objectTokenValues = tokenValue;
        const tokenObjectOptionsFilterMode =
          resolveTokenObjectOptionsFilterMode(objectTokenOptions);

        if (tokenObjectOptionsFilterMode === 'whitelist') {
          acc[tokenName] = Object.entries(objectTokenOptions).reduce(
            (acc, [objectTokenName, objectTokenOption]) => {
              if (objectTokenOption) {
                acc[objectTokenName] = getByFlattenKey(objectTokenValues, objectTokenName);
              }
              return acc;
            },
            {} as PlainObject
          );
        }
        if (tokenObjectOptionsFilterMode === 'blacklist') {
          acc[tokenName] = Object.keys(objectTokenValues).reduce((acc, objectTokenName) => {
            if (objectTokenOptions[objectTokenName] !== false) {
              acc[objectTokenName] = getByFlattenKey(objectTokenValues, objectTokenName);
            }
            return acc;
          }, {} as PlainObject);
        }
      }

      return acc;
    }, {} as PlainObject)
  );
