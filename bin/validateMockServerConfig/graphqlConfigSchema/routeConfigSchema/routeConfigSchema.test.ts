import { getMostSpecificPathFromError, getValidationMessageFromPath } from '../../../helpers';

import { routeConfigSchema } from './routeConfigSchema';

describe('routeConfigSchema: data resolving properties combinations', () => {
  const incorrectDataResolvingPropertiesCombinations = [
    {},
    { data: {}, queue: [], settings: { polling: true } }
  ];
  incorrectDataResolvingPropertiesCombinations.forEach(
    (incorrectDataResolvingPropertiesCombination) => {
      test(`Should return error on handle object with incorrect data resolving properties combination:\n${JSON.stringify(
        incorrectDataResolvingPropertiesCombination
      )}`, () => {
        const parseResult = routeConfigSchema.safeParse(
          incorrectDataResolvingPropertiesCombination
        );
        expect(parseResult.success).toBe(false);

        if (!parseResult.success) {
          const path = getMostSpecificPathFromError(parseResult.error);
          const validationMessage = getValidationMessageFromPath(path);
          expect(validationMessage).toBe('');
        }
      });
    }
  );

  const correctDataResolvingPropertiesCombinations = [
    { data: {} },
    { queue: [], settings: { polling: true } }
  ];
  correctDataResolvingPropertiesCombinations.forEach(
    (correctDataResolvingPropertiesCombination) => {
      test(`Should pass object with correct data resolving properties combination:\n${JSON.stringify(
        correctDataResolvingPropertiesCombination
      )}`, () => {
        const parseResult = routeConfigSchema.safeParse(correctDataResolvingPropertiesCombination);
        expect(parseResult.success).toBe(true);
      });
    }
  );
});
