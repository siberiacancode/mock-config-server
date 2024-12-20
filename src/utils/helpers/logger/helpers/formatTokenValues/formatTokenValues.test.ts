import { formatTokenValues } from './formatTokenValues';

describe('formatTokenValues', () => {
  const rawTokenValues = {
    timestamp: 1735623296789,
    method: 'get',
    statusCode: 200
  };

  test('Should correctly format token values', () => {
    const result = formatTokenValues(rawTokenValues);

    expect(result).toStrictEqual({
      timestamp: '31.12.2024, 12:34:56,789',
      method: 'GET',
      statusCode: 200
    });
  });
});
