import { CHECK_MODES, PLAIN_ENTITY_CHECK_MODES } from '@/utils/constants';

import { isCheckModeValid } from './isCheckModeValid';

describe('isCheckModeValid', () => {
  test('Should correctly validate mapped entity checkModes', () => {
    CHECK_MODES.forEach((correctMappedEntityCheckMode) => {
      expect(isCheckModeValid(correctMappedEntityCheckMode)).toBe(true);
    });

    expect(isCheckModeValid('wrongCheckMode')).toBe(false);
  });

  test('Should correctly validate plain entity checkModes', () => {
    const plainEntityNames = ['body', 'variables'];
    plainEntityNames.forEach((plainEntityName) => {
      CHECK_MODES.forEach((checkMode) => {
        const isPlainEntityCheckMode = PLAIN_ENTITY_CHECK_MODES.includes(checkMode);
        expect(isCheckModeValid(checkMode, plainEntityName)).toBe(isPlainEntityCheckMode);
      });

      expect(isCheckModeValid('wrongCheckMode', plainEntityName)).toBe(false);
    });
  });
});
