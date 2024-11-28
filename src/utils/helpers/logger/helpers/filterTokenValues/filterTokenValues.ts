import { flatten, unflatten } from 'flat';

import type {
  LoggerAPI,
  LoggerTokenFlags,
  LoggerTokenValues,
  LoggerType,
  PlainObject
} from '@/utils/types';

type FilterTokenValues = <Type extends LoggerType, API extends LoggerAPI>(
  rawTokenValues: LoggerTokenValues<Type, API>,
  tokenFlags: LoggerTokenFlags<Type, API>
) => Partial<LoggerTokenValues<Type, API>>;

export const filterTokenValues: FilterTokenValues = (rawTokenValues, tokenFlags) => {
  const flattenRawTokenValues = flatten<any, any>(rawTokenValues);
  const flattenTokenFlags = flatten<any, any>(tokenFlags);

  const flattenFilteredTokenValues = Object.keys(flattenRawTokenValues).reduce((acc, tokenName) => {
    // ✅ important:
    // second case to allow get all mappedEntity properties
    // e.g. query: true will return all query object keys
    if (flattenTokenFlags[tokenName] || flattenTokenFlags[tokenName.split('.')[0]]) {
      acc[tokenName] = flattenRawTokenValues[tokenName];
    }
    return acc;
  }, {} as PlainObject);

  return unflatten(flattenFilteredTokenValues);
};
