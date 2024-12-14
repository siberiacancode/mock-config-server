import { z } from 'zod';

import {
  checkActualValueCheckModeSchema,
  compareWithDescriptorAnyValueCheckModeSchema,
  compareWithDescriptorStringValueCheckModeSchema,
  compareWithDescriptorValueCheckModeSchema,
  entityDescriptorSchema
} from '../checkModeSchema/checkModeSchema';
import { extendedDiscriminatedUnion } from '../extendedDiscriminatedUnion/extendedDiscriminatedUnion';
import { nestedObjectOrArraySchema } from '../nestedObjectOrArraySchema/nestedObjectOrArraySchema';
import { plainObjectSchema } from '../plainObjectSchema/plainObjectSchema';

/* ----- Plain entity schema ----- */

const plainEntityPrimitiveValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const plainEntityObjectiveValueSchema = nestedObjectOrArraySchema(plainEntityPrimitiveValueSchema);

const topLevelPlainEntityDescriptorSchema = extendedDiscriminatedUnion('checkMode', [
  [checkActualValueCheckModeSchema, entityDescriptorSchema(checkActualValueCheckModeSchema)],
  [z.literal('function'), entityDescriptorSchema(z.literal('function'), z.function())],
  [
    compareWithDescriptorAnyValueCheckModeSchema,
    entityDescriptorSchema(
      compareWithDescriptorAnyValueCheckModeSchema,
      plainEntityObjectiveValueSchema
    )
  ]
]);

const propertyLevelPlainEntityDescriptorSchema = extendedDiscriminatedUnion('checkMode', [
  [checkActualValueCheckModeSchema, entityDescriptorSchema(checkActualValueCheckModeSchema)],
  [z.literal('function'), entityDescriptorSchema(z.literal('function'), z.function())],
  [z.literal('regExp'), entityDescriptorSchema(z.literal('regExp'), z.instanceof(RegExp))],
  [
    compareWithDescriptorAnyValueCheckModeSchema,
    entityDescriptorSchema(
      compareWithDescriptorAnyValueCheckModeSchema,
      z.union([plainEntityPrimitiveValueSchema, plainEntityObjectiveValueSchema])
    )
  ],
  [
    compareWithDescriptorStringValueCheckModeSchema,
    entityDescriptorSchema(
      compareWithDescriptorStringValueCheckModeSchema,
      plainEntityPrimitiveValueSchema
    )
  ]
]);

const nonCheckModeSchema = (schema: z.ZodTypeAny) =>
  plainObjectSchema(schema.and(z.object({ checkMode: z.never().optional() })));

const topLevelPlainEntityRecordSchema = nonCheckModeSchema(
  z.record(
    z.union([
      propertyLevelPlainEntityDescriptorSchema,
      nonCheckModeSchema(plainEntityObjectiveValueSchema),
      plainEntityPrimitiveValueSchema
    ])
  )
);

const topLevelPlainEntityArraySchema = z.array(
  z.union([plainEntityPrimitiveValueSchema, plainEntityObjectiveValueSchema])
);

export const plainEntitySchema = z.union([
  topLevelPlainEntityDescriptorSchema,
  topLevelPlainEntityRecordSchema,
  topLevelPlainEntityArraySchema
]);

/* ----- Mapped entity schema ----- */

const mappedEntityValueSchema = z.union([z.string(), z.number(), z.boolean()]);

const mappedEntityDescriptorSchema = extendedDiscriminatedUnion('checkMode', [
  [checkActualValueCheckModeSchema, entityDescriptorSchema(checkActualValueCheckModeSchema)],
  [z.literal('function'), entityDescriptorSchema(z.literal('function'), z.function())],
  [z.literal('regExp'), entityDescriptorSchema(z.literal('regExp'), z.instanceof(RegExp))],
  [
    compareWithDescriptorValueCheckModeSchema,
    entityDescriptorSchema(compareWithDescriptorValueCheckModeSchema, mappedEntityValueSchema)
  ]
]);

export const mappedEntitySchema = plainObjectSchema(
  z.record(z.union([mappedEntityValueSchema, mappedEntityDescriptorSchema]))
);
