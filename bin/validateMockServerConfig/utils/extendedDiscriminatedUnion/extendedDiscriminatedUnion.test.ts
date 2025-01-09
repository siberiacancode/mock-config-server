import { z } from 'zod';

import { getMostSpecificPathFromError, getValidationMessageFromPath } from '../../../helpers';

import { extendedDiscriminatedUnion } from './extendedDiscriminatedUnion';

describe('extendedDiscriminatedUnion', () => {
  test('Should return correct error path if discriminator is not presented in parsed value', () => {
    const value = {
      property: { age: 34 }
    };
    const schema = z.object({
      property: extendedDiscriminatedUnion('name', [
        z.object({ name: z.literal('John'), age: z.number() }),
        z.discriminatedUnion('name', [
          z.object({ name: z.literal('Jane'), age: z.number() }),
          z.object({ name: z.literal('Jack'), age: z.number() })
        ])
      ])
    });

    const schemaParseResult = schema.safeParse(value);
    expect(schemaParseResult.success).toBe(false);

    if (!schemaParseResult.success) {
      const path = getMostSpecificPathFromError(schemaParseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('.property');
    }
  });

  test('Should return correct error path if none of passed variants have matched discriminator', () => {
    const value = {
      property: { name: 'Joe', age: 34 }
    };
    const schema = z.object({
      property: extendedDiscriminatedUnion('name', [
        z.object({ name: z.literal('John'), age: z.number() }),
        z.discriminatedUnion('name', [
          z.object({ name: z.literal('Jane'), age: z.number() }),
          z.object({ name: z.literal('Jack'), age: z.number() })
        ])
      ])
    });

    const schemaParseResult = schema.safeParse(value);
    expect(schemaParseResult.success).toBe(false);

    if (!schemaParseResult.success) {
      const path = getMostSpecificPathFromError(schemaParseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('.property.name');
    }
  });

  test('Should return correct error path if object variant matched by discriminator, but some of other properties not', () => {
    const value = {
      property: { name: 'John', age: true }
    };
    const schema = z.object({
      property: extendedDiscriminatedUnion('name', [
        z.object({ name: z.literal('John'), age: z.number() })
      ])
    });

    const schemaParseResult = schema.safeParse(value);
    expect(schemaParseResult.success).toBe(false);

    if (!schemaParseResult.success) {
      const path = getMostSpecificPathFromError(schemaParseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('.property.age');
    }
  });

  test('Should return correct error path if union variant matched by discriminator, but some of other properties not', () => {
    const value = {
      property: { name: 'Jane', age: true }
    };
    const schema = z.object({
      property: extendedDiscriminatedUnion('name', [
        z.discriminatedUnion('name', [
          z.object({ name: z.literal('Jane'), age: z.number() }),
          z.object({ name: z.literal('Jack'), age: z.number() })
        ])
      ])
    });

    const schemaParseResult = schema.safeParse(value);
    expect(schemaParseResult.success).toBe(false);

    if (!schemaParseResult.success) {
      const path = getMostSpecificPathFromError(schemaParseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('.property.age');
    }
  });
});
