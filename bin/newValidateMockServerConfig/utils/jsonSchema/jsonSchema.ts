import { z } from 'zod';

import { isPlainObject } from '@/utils/helpers';

export const jsonLiteralSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

type JsonLiteral = z.infer<typeof jsonLiteralSchema>;
type Json = JsonLiteral | { [key: string]: Json } | Json[];

export const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    jsonLiteralSchema,
    z.array(jsonSchema),
    // ✅ important:
    // using 'and' checking instead of 'nonRegExpSchema' because of zod types peculiarities
    z.record(jsonSchema).and(z.custom((value) => isPlainObject(value)))
  ])
);
