import { z } from 'zod';

export const settingsSchema = z.strictObject({
  polling: z.boolean().optional()
});
