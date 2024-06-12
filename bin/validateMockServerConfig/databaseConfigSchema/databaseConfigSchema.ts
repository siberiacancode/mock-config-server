import { z } from 'zod';

import { baseUrlSchema } from '../baseUrlSchema/baseUrlSchema';
import { interceptorsSchema } from '../interceptorsSchema/interceptorsSchema';
import { plainObjectSchema, stringForwardSlashSchema, stringJsonFilenameSchema } from '../utils';

export const databaseConfigSchema = z.strictObject({
  baseUrl: baseUrlSchema.optional(),
  data: z.union([plainObjectSchema(z.record(z.unknown())), stringJsonFilenameSchema]),
  routes: z
    .union([
      plainObjectSchema(z.record(stringForwardSlashSchema, stringForwardSlashSchema)),
      stringJsonFilenameSchema
    ])
    .optional(),
  interceptors: plainObjectSchema(interceptorsSchema).optional()
});
