import { z } from 'zod';

import type { NestedObjectOrArray } from '@/utils/types';

export const stringForwardSlashSchema = z.string().startsWith('/');

export const stringJsonFilenameSchema = z.string().endsWith('.json');

type SchemaType<T extends z.ZodType<any>> = T extends z.ZodType<infer U> ? U : never;

export const nestedObjectOrArraySchema = <T extends z.ZodType>(
  schema: T
): z.ZodType<NestedObjectOrArray<SchemaType<T>>> =>
  z.union([
    z.record(z.union([z.lazy(() => nestedObjectOrArraySchema(schema)), schema])),
    z.array(z.union([z.lazy(() => nestedObjectOrArraySchema(schema)), schema]))
  ]);
