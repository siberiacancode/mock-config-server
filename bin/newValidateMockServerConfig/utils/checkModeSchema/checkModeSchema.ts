import { z } from 'zod';

// TODO delete useless schemas after all

export const checkActualValueCheckModeSchema = z.enum(['exists', 'notExists']);

export const compareWithDescriptorAnyValueCheckModeSchema = z.enum(['equals', 'notEquals']);

export const compareWithDescriptorStringValueCheckModeSchema = z.enum([
  'includes',
  'notIncludes',
  'startsWith',
  'notStartsWith',
  'endsWith',
  'notEndsWith'
]);

export const compareWithDescriptorValueCheckModeSchema = z.enum([
  ...compareWithDescriptorAnyValueCheckModeSchema.options,
  ...compareWithDescriptorStringValueCheckModeSchema.options
]);

export const calculateByDescriptorValueCheckModeSchema = z.enum(['regExp', 'function']);

export const checkModeSchema = z.enum([
  ...checkActualValueCheckModeSchema.options,
  ...compareWithDescriptorValueCheckModeSchema.options,
  ...calculateByDescriptorValueCheckModeSchema.options
]);
