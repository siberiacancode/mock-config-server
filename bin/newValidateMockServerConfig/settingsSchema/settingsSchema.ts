import { z } from 'zod';

export const settingsSchema = z
  .object({
    polling: z.boolean().optional()
  })
  .strict();
