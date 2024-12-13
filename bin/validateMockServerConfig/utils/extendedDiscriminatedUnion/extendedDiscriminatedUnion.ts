import { z } from 'zod';

import { isPlainObject } from '@/utils/helpers';

import { getMostSpecificPathFromError } from '../../../helpers';

// ✅ important:
// first element for check discriminator, second element for check discriminator + rest of properties
type ExtendedDiscriminatedUnionOption = readonly [z.ZodTypeAny, z.ZodTypeAny];

export const extendedDiscriminatedUnion = <Discriminator extends string>(
  discriminator: Discriminator,
  options: [
    ExtendedDiscriminatedUnionOption,
    ExtendedDiscriminatedUnionOption,
    ...ExtendedDiscriminatedUnionOption[]
  ]
) =>
  z
    .custom((value) => isPlainObject(value) && discriminator in value)
    .superRefine((value, context) => {
      const optionWithMatchedDiscriminatorSchema = options.find(([discriminatorSchema]) => {
        const discriminatorSchemaParseResult = z
          .object({ [discriminator]: discriminatorSchema })
          .safeParse(value);
        return discriminatorSchemaParseResult.success;
      });

      if (!optionWithMatchedDiscriminatorSchema) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [discriminator],
          fatal: true
        });
        return z.NEVER;
      }

      const [, restPropertiesSchema] = optionWithMatchedDiscriminatorSchema;
      const restPropertiesSchemaParseResult = restPropertiesSchema.safeParse(value);
      if (!restPropertiesSchemaParseResult.success) {
        const issuePath = getMostSpecificPathFromError(restPropertiesSchemaParseResult.error);
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: issuePath,
          fatal: true
        });
        return z.NEVER;
      }
    });
