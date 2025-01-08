import { z } from 'zod';

import { requiredPropertiesSchema } from '../utils';

export const queueSchema = z.array(
  z.union([
    requiredPropertiesSchema(
      z.strictObject({
        time: z.number().int().nonnegative().optional(),
        data: z.union([z.function(), z.any()])
      }),
      ['data']
    ),
    z.strictObject({
      time: z.number().int().nonnegative().optional(),
      file: z.string()
    })
  ])
);
