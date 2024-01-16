import { z } from 'zod';

import { validateNonOptionalUndefined } from '@/utils/helpers';

export const queueSchema = z.array(
  validateNonOptionalUndefined(
    z
      .object({
        time: z.number().int().nonnegative().optional(),
        data: z.union([z.function(), z.any()])
      })
      .strict(),
    ['data']
  )
);
