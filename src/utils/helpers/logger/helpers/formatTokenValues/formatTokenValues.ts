import type { PlainObject } from '@/utils/types';

import { formatTimestamp } from '../../../date';

export const formatTokenValues = (tokenValues: PlainObject) => {
  const { timestamp, method } = tokenValues;

  return {
    ...tokenValues,
    ...(timestamp && { timestamp: formatTimestamp(timestamp) }),
    ...(method && { method: method.toUpperCase() })
  };
};
