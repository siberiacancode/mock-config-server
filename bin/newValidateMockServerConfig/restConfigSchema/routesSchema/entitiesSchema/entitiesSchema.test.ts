import { getMostSpecificPathFromError, getValidationMessageFromPath } from '@/utils/helpers';

import { entitiesByEntityNameSchema } from './entitiesSchema';

describe('entitiesByEntityNameSchema: body checkMode exclude', () => {
  test('Should return correct error path for body descriptor (top and property level)', () => {
    const schema = entitiesByEntityNameSchema('post');

    const incorrectTopLevelDescriptorBodyEntities = {
      body: {
        checkMode: 'equals'
      }
    };
    const topLevelParseResult = schema.safeParse(incorrectTopLevelDescriptorBodyEntities);
    expect(topLevelParseResult.success).toBe(false);

    if (!topLevelParseResult.success) {
      const path = getMostSpecificPathFromError(topLevelParseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('.body.value');
    }

    const incorrectPropertyLevelDescriptorBodyEntities = {
      body: {
        property: {
          checkMode: 'equals'
        }
      }
    };
    const propertyLevelParseResult = schema.safeParse(incorrectPropertyLevelDescriptorBodyEntities);
    expect(propertyLevelParseResult.success).toBe(false);

    if (!propertyLevelParseResult.success) {
      const path = getMostSpecificPathFromError(propertyLevelParseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('.body.property.value');
    }
  });

  test('Should return correct path for body object (top and property level) with checkMode property', () => {
    const schema = entitiesByEntityNameSchema('post');

    const incorrectTopLevelObjectBodyEntities = {
      body: {
        checkMode: 'some random string'
      }
    };
    const topLevelParseResult = schema.safeParse(incorrectTopLevelObjectBodyEntities);
    expect(topLevelParseResult.success).toBe(false);

    if (!topLevelParseResult.success) {
      const path = getMostSpecificPathFromError(topLevelParseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('.body.checkMode');
    }

    const incorrectPropertyLevelObjectBodyEntities = {
      body: {
        property: {
          checkMode: 'some random string'
        }
      }
    };
    const propertyLevelParseResult = schema.safeParse(incorrectPropertyLevelObjectBodyEntities);
    expect(propertyLevelParseResult.success).toBe(false);

    if (!propertyLevelParseResult.success) {
      const path = getMostSpecificPathFromError(propertyLevelParseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('.body.property.checkMode');
    }
  });
});
