import { validateSettings } from './validateSettings';

describe('validateSettings', () => {
  test('Should correctly handle settings only with correct type', () => {
    const correctSettingsValues = [{ polling: true }, undefined];
    correctSettingsValues.forEach((correctSettingsValue) => {
      expect(() => validateSettings(correctSettingsValue)).not.toThrow(Error);
    });

    const incorrectSettingsValues = ['string', true, 3000, null, [], () => {}];
    incorrectSettingsValues.forEach((incorrectSettingsValue) => {
      expect(() => validateSettings(incorrectSettingsValue)).toThrow(new Error('settings'));
    });
  });
});
