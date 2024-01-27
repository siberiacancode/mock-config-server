import { z } from 'zod';

export const nonRegExpSchema = (schema: z.ZodTypeAny) =>
  z.custom((value) => !(value instanceof RegExp)).pipe(schema);
