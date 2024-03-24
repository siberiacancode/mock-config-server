import { z } from 'zod';

// ✅ important:
// this schema is needed because zod handle RegExps as plain object
export const nonRegExpSchema = (schema: z.ZodTypeAny) =>
  z.custom((value) => !(value instanceof RegExp)).pipe(schema);
