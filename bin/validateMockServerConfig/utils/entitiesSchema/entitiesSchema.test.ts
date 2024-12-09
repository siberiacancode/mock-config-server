import { getMostSpecificPathFromError, getValidationMessageFromPath } from '../../../helpers';

import { plainEntitySchema } from './entitiesSchema';

test('Should return correct error path: firstly check object as a descriptor', () => {
  const incorrectTopLevelDescriptorBodyEntities = {
    checkMode: 'equals'
  };
  const topLevelParseResult = plainEntitySchema.safeParse(incorrectTopLevelDescriptorBodyEntities);
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