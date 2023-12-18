import { validateQueue } from './validateQueue';

describe('validateQueue', () => {
  test('Should correctly handle queue only with correct type', () => {
    const correctSettingsValues = [[], [{ data: null }], [{ data: null, time: 0 }]];

    correctSettingsValues.forEach((correctSettingsValue) => {
      expect(() => validateQueue(correctSettingsValue)).not.toThrow(Error);
    });

    const incorrectQueueValues = ['string', true, 3000, null, undefined, {}, () => {}, /\d/];
    incorrectQueueValues.forEach((incorrectQueueValue) => {
      expect(() => validateQueue(incorrectQueueValue)).toThrow(new Error('queue'));
    });

    const incorrectQueueDataTimeValues = ['string', true, null, undefined, {}, [], () => {}, /\d/];
    incorrectQueueDataTimeValues.forEach((incorrectQueueDataTimeValue) => {
      expect(() => validateQueue([{ data: null, time: incorrectQueueDataTimeValue }])).toThrow(
        new Error('queue[0].time')
      );
    });
  });
});
