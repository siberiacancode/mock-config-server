import { validateSettings } from './validateSettings';

describe('validateSettings', () => {
  test('Should correctly handle settings only with correct type', () => {
    const correctSettingsValues = [{ polling: true }, { delay: 1000 }, { status: 200 }, undefined];
    correctSettingsValues.forEach((correctSettingsValue) => {
      expect(() => validateSettings(correctSettingsValue)).not.toThrow(Error);
    });

    const incorrectSettingsValues = ['string', true, 3000, null, [], () => {}];
    incorrectSettingsValues.forEach((incorrectSettingsValue) => {
      expect(() => validateSettings(incorrectSettingsValue)).toThrow(new Error('settings'));
    });

    const incorrectPollingValues = ['string', 3000, null, [], () => {}, {}];
    incorrectPollingValues.forEach((incorrectPollingValue) => {
      expect(() => validateSettings({ polling: incorrectPollingValue })).toThrow(
        new Error('settings.polling')
      );
    });

    const incorrectDelayValues = ['string', true, null, [], () => {}, {}];
    incorrectDelayValues.forEach((incorrectDelayValue) => {
      expect(() => validateSettings({ delay: incorrectDelayValue })).toThrow(
        new Error('settings.delay')
      );
    });

    const incorrectStatusValues = ['string', true, null, [], () => {}, 199, 600, {}];
    incorrectStatusValues.forEach((incorrectStatusValue) => {
      expect(() => validateSettings({ status: incorrectStatusValue })).toThrow(
        new Error('settings.status')
      );
    });
  });
});
