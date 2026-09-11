import { z } from 'zod';

import type { Comparator } from '@/utils/types';

import { isComparator } from '@/utils/helpers';

import { settingsSchema } from '../../settingsSchema/settingsSchema';
import { plainObjectSchema } from '../../utils';

export const closeRouteConfigSchema = z.strictObject({
  data: z.function(),
  entities: plainObjectSchema(
    z.strictObject({
      code: z.union([z.number(), z.custom<Comparator>(isComparator)]).optional(),
      reason: z.union([z.string(), z.custom<Comparator>(isComparator)]).optional()
    })
  ).optional(),
  settings: plainObjectSchema(settingsSchema.pick({ delay: true })).optional()
});
