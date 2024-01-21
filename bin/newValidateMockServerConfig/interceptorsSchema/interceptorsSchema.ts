import { z } from 'zod';

export const interceptorsSchema = z.strictObject({
  request: z.function().optional(),
  response: z.function().optional()
});
