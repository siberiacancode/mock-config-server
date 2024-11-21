import { getMostSpecificPathFromError } from '../../getMostSpecificPathFromError';
import { getValidationMessageFromPath } from '../../getValidationMessageFromPath';

import { plainEntitySchema } from './entitiesSchema';

describe('plainEntitySchema: checkMode exclude', () => {
  test('Should return correct error path for descriptor (top and property level) without required value', () => {
    const incorrectTopLevelDescriptorBodyEntities = {
      checkMode: 'equals'
    };
    const topLevelParseResult = plainEntitySchema.safeParse(
      incorrectTopLevelDescriptorBodyEntities
    );
    expect(topLevelParseResult.success).toBe(false);

    if (!topLevelParseResult.success) {
      const path = getMostSpecificPathFromError(topLevelParseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('.value');
    }

    const incorrectPropertyLevelDescriptorBodyEntities = {
      property: {
        checkMode: 'equals'
      }
    };
    const propertyLevelParseResult = plainEntitySchema.safeParse(
      incorrectPropertyLevelDescriptorBodyEntities
    );
    expect(propertyLevelParseResult.success).toBe(false);

    if (!propertyLevelParseResult.success) {
      const path = getMostSpecificPathFromError(propertyLevelParseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('.property.value');
    }
  });

  test('Should return correct path for object (top and property level) with checkMode property', () => {
    const incorrectTopLevelObjectBodyEntities = {
      checkMode: 'some random string'
    };
    const topLevelParseResult = plainEntitySchema.safeParse(incorrectTopLevelObjectBodyEntities);
    expect(topLevelParseResult.success).toBe(false);

    if (!topLevelParseResult.success) {
      const path = getMostSpecificPathFromError(topLevelParseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('.checkMode');
    }

    const incorrectPropertyLevelObjectBodyEntities = {
      property: {
        checkMode: 'some random string'
      }
    };
    const propertyLevelParseResult = plainEntitySchema.safeParse(
      incorrectPropertyLevelObjectBodyEntities
    );
    expect(propertyLevelParseResult.success).toBe(false);

    if (!propertyLevelParseResult.success) {
      const path = getMostSpecificPathFromError(propertyLevelParseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('.property.checkMode');
    }
  });
});
