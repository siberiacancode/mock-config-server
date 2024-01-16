import { z } from 'zod';

import { getMostSpecificIssueFromError, getValidationMessageFromPath } from '@/utils/helpers';

export const validateCors = (cors: unknown) => {
  const StringOrRegExpSchema = z.union([z.string(), z.instanceof(RegExp)]);
  const OriginSchema = z.union([StringOrRegExpSchema, z.array(StringOrRegExpSchema), z.function()]);

  const CorsSchema = z
    .object({
      origin: OriginSchema,
      methods: z.array(z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])).optional(),
      allowedHeaders: z.array(z.string()).optional(),
      exposedHeaders: z.array(z.string()).optional(),
      credentials: z.boolean().optional(),
      maxAge: z.number().int().positive().optional()
    })
    .strict()
    .optional();

  const result = CorsSchema.safeParse(cors);
  if (!result.success) {
    const issue = getMostSpecificIssueFromError(result.error);
    const validationMessage = getValidationMessageFromPath(issue.path);

    throw new Error(`cors${validationMessage}`);
  }
};
