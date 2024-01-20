import { z } from 'zod';

import { plainObjectSchema } from '../utils';

export const queueSchema = z.array(
  plainObjectSchema(
    z.strictObject({
      time: z.number().int().nonnegative().optional(),
      data: z.union([z.function(), z.any()])
    }),
    ['data']
  )
);
