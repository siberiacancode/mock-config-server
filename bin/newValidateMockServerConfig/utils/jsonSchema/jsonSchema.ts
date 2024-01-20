import { z } from 'zod';

import { isPlainObject } from '@/utils/helpers';

type JsonLiteral = z.infer<typeof jsonLiteralSchema>;
type Json = JsonLiteral | { [key: string]: Json } | Json[];

export const jsonLiteralSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    jsonLiteralSchema,
    z.array(jsonSchema),
    // FIXME 'and' statement is useless?
    z.record(jsonSchema).and(z.custom((value) => isPlainObject(value)))
  ])
);
