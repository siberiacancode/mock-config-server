import { z } from 'zod';

import { nonRegExpSchema, stringForwardSlashSchema, stringJsonFilenameSchema } from '../utils';

export const databaseConfigSchema = z.strictObject({
  data: z.union([nonRegExpSchema(z.record(z.unknown())), stringJsonFilenameSchema]),
  routes: z
    .union([
      nonRegExpSchema(z.record(stringForwardSlashSchema, stringForwardSlashSchema)),
      stringJsonFilenameSchema
    ])
    .optional()
});
