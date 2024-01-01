import { z } from 'zod';

export const queueSchema = z.array(
  z
    .object({
      time: z.number().int().nonnegative().optional(),
      data: z.union([z.function(), z.any()])
    })
    .strict()
);
