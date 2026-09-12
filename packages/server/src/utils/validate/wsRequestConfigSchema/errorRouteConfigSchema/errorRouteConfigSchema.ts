import { z } from 'zod';

import type { Comparator } from '@/utils/types';

import { isComparator } from '@/utils/helpers';

import { settingsSchema } from '../../settingsSchema/settingsSchema';
import { plainObjectSchema } from '../../utils';

export const errorRouteConfigSchema = z.strictObject({
  data: z.function(),
  entities: plainObjectSchema(
    z.strictObject({
      code: z.union([z.string(), z.custom<Comparator>(isComparator)]).optional(),
      message: z.union([z.string(), z.custom<Comparator>(isComparator)]).optional()
    })
  ).optional(),
  settings: plainObjectSchema(settingsSchema.pick({ delay: true })).optional()
});
