import { z } from 'zod';

import {
  CHECK_ACTUAL_VALUE_CHECK_MODES,
  COMPARE_WITH_DESCRIPTOR_ANY_VALUE_CHECK_MODES,
  COMPARE_WITH_DESCRIPTOR_STRING_VALUE_CHECK_MODES,
  COMPARE_WITH_DESCRIPTOR_VALUE_CHECK_MODES
} from '@/utils/constants';

export const checkActualValueCheckModeSchema = z.enum(CHECK_ACTUAL_VALUE_CHECK_MODES);

export const compareWithDescriptorAnyValueCheckModeSchema = z.enum(
  COMPARE_WITH_DESCRIPTOR_ANY_VALUE_CHECK_MODES
);

export const compareWithDescriptorStringValueCheckModeSchema = z.enum(
  COMPARE_WITH_DESCRIPTOR_STRING_VALUE_CHECK_MODES
);

export const compareWithDescriptorValueCheckModeSchema = z.enum(
  COMPARE_WITH_DESCRIPTOR_VALUE_CHECK_MODES
);

export const entityDescriptorSchema = (
  checkModeSchema:
    | typeof checkActualValueCheckModeSchema
    | typeof compareWithDescriptorAnyValueCheckModeSchema
    | typeof compareWithDescriptorStringValueCheckModeSchema
    | typeof compareWithDescriptorValueCheckModeSchema
    | z.ZodLiteral<'function'>
    | z.ZodLiteral<'regExp'>,
  valueSchema?: z.ZodTypeAny
) =>
  valueSchema
    ? z.union([
        z.strictObject({
          checkMode: checkModeSchema,
          value: z.array(valueSchema),
          oneOf: z.literal(true)
        }),
        z.strictObject({
          checkMode: checkModeSchema,
          value: valueSchema,
          oneOf: z.literal(false).optional()
        })
      ])
    : z.strictObject({
        checkMode: checkModeSchema
      });
