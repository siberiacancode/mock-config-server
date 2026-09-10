import { z } from 'zod';

import { mappedEntitySchema, plainObjectSchema } from '../../utils';

export const connectionRouteConfigSchema = z.strictObject({
  data: z.function(),
  entities: plainObjectSchema(
    z.strictObject({
      headers: mappedEntitySchema.optional(),
      cookies: mappedEntitySchema.optional(),
      queries: mappedEntitySchema.optional()
    })
  ).optional()
});
