import { z } from 'zod';

import { getMostSpecificPathFromError, getValidationMessageFromPath } from '@/utils/helpers';

export const validateDatabaseConfig = (databaseConfig: unknown) => {
  const ForwardSlashStringSchema = z.string().startsWith('/');
  const JsonFilenameStringSchema = z.string().endsWith('.json');

  const DataSchema = z.union([z.record(z.unknown()), JsonFilenameStringSchema]);
  const RoutesSchema = z
    .union([z.record(ForwardSlashStringSchema, ForwardSlashStringSchema), JsonFilenameStringSchema])
    .optional();

  const DatabaseConfigSchema = z
    .object({
      data: DataSchema,
      routes: RoutesSchema
    })
    .strict()
    .optional();

  const result = DatabaseConfigSchema.safeParse(databaseConfig);
  if (!result.success) {
    const path = getMostSpecificPathFromError(result.error);
    const validationMessage = getValidationMessageFromPath(path);

    throw new Error(`database${validationMessage}`);
  }
};
