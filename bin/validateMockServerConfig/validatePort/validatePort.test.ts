import { validatePort } from './validatePort';

describe('validatePort', () => {
  test('Should correctly handle port only with correct type', () => {
    const correctPortValues = [3000, undefined];
    correctPortValues.forEach((correctPortValue) => {
      expect(() => validatePort(correctPortValue)).not.toThrow(Error);
    });
  });

  const incorrectPortValues = ['string', true, null, {}, [], () => {}];
  incorrectPortValues.forEach((incorrectPortValue) => {
    expect(() => validatePort(incorrectPortValue)).toThrow(new Error('port'));
  });
});
