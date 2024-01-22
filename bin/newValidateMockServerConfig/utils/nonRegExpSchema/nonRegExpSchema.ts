import { z } from 'zod';

export const nonRegExpSchema = (schema: z.ZodTypeAny) =>
  schema.and(z.custom((value) => !(value instanceof RegExp)));
