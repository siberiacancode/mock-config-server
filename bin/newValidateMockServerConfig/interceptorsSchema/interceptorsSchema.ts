import { z } from 'zod';

export const interceptorsSchema = z
  .object({
    request: z.function().optional(),
    response: z.function().optional()
  })
  .strict();
