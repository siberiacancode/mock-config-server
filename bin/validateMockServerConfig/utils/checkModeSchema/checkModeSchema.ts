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

export function entityDescriptorSchema(
  checkModeSchema: typeof checkActualValueCheckModeSchema
): z.ZodObject<{ checkMode: typeof checkModeSchema }, 'strict'>;

export function entityDescriptorSchema(
  checkModeSchema:
    | typeof compareWithDescriptorAnyValueCheckModeSchema
    | typeof compareWithDescriptorStringValueCheckModeSchema
    | typeof compareWithDescriptorValueCheckModeSchema
    | z.ZodLiteral<'function'>
    | z.ZodLiteral<'regExp'>,
  valueSchema: z.ZodTypeAny
): z.ZodUnion<
  [
    z.ZodObject<
      {
        checkMode: typeof checkModeSchema;
        oneOf: z.ZodLiteral<true>;
        value: z.ZodArray<typeof valueSchema>;
      },
      'strict'
    >,
    z.ZodObject<
      {
        checkMode: typeof checkModeSchema;
        oneOf: z.ZodOptional<z.ZodLiteral<false>>;
        value: typeof valueSchema;
      },
      'strict'
    >
  ]
>;

export function entityDescriptorSchema(
  checkModeSchema:
    | typeof checkActualValueCheckModeSchema
    | typeof compareWithDescriptorAnyValueCheckModeSchema
    | typeof compareWithDescriptorStringValueCheckModeSchema
    | typeof compareWithDescriptorValueCheckModeSchema
    | z.ZodLiteral<'function'>
    | z.ZodLiteral<'regExp'>,
  valueSchema?: z.ZodTypeAny
) {
  const isCheckActualValueCheckMode = !valueSchema;
  if (isCheckActualValueCheckMode) {
    return z.strictObject({
      checkMode: checkModeSchema
    });
  }

  return z.union([
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
  ]);
}
