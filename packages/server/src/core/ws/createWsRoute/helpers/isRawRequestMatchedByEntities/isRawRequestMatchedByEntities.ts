import type { RawWsRequestArtifact, WsFrame } from '@/utils/types';

import { isComparator, resolveEntityValues } from '@/utils/helpers';

import { equals } from '../../../../entities';

export const isRawRequestMatchedByEntities = (
  frame: WsFrame,
  entities: RawWsRequestArtifact['config']['entities']
) => {
  if (!entities) return true;

  const { isBinary, raw } = entities;

  if (isBinary !== undefined) {
    const comparator = isComparator(isBinary) ? isBinary : equals(isBinary);
    if (!resolveEntityValues({ actual: frame.isBinary, comparator })) return false;
  }

  return raw?.(frame.raw) ?? true;
};
