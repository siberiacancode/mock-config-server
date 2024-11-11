import type { LoggerTokenValues, MappedEntityName } from '@/utils/types';

const mappedEntityNames: MappedEntityName[] = ['headers', 'query', 'params', 'cookies'];

type TokenName =
  | keyof LoggerTokenValues<'request', 'rest'>
  | keyof LoggerTokenValues<'request', 'graphql'>
  | keyof LoggerTokenValues<'response', 'rest'>
  | keyof LoggerTokenValues<'response', 'graphql'>;

export const isTokenNameMappedEntity = (tokenName: TokenName): tokenName is MappedEntityName =>
  !!mappedEntityNames.find((mappedEntityName) => mappedEntityName === tokenName);
