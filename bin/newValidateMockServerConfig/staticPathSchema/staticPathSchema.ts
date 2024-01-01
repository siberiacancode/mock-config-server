import { z } from 'zod';

import { stringForwardSlashSchema } from '../utils';

const staticPathObjectSchema = z
  .object({
    prefix: stringForwardSlashSchema,
    path: stringForwardSlashSchema
  })
  .strict();

const staticPathStringOrObjectSchema = z.union([stringForwardSlashSchema, staticPathObjectSchema]);

export const staticPathSchema = z.union([
  staticPathStringOrObjectSchema,
  z.array(staticPathStringOrObjectSchema)
]);
