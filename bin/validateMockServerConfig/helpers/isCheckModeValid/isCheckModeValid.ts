import { CHECK_MODES, PLAIN_ENTITY_CHECK_MODES } from '@/utils/constants';
import type { CheckMode, PlainEntityCheckMode } from '@/utils/types';

export const isCheckModeValid = (checkMode: unknown, entityName?: unknown) => {
  if (entityName === 'body' || entityName === 'variables')
    return PLAIN_ENTITY_CHECK_MODES.includes(checkMode as PlainEntityCheckMode);
  return CHECK_MODES.includes(checkMode as CheckMode);
};
