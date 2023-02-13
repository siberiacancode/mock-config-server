import { getActualGraphqlUrlMeaningfulString } from './getActualGraphqlUrlMeaningfulString';

describe('getActualGraphqlUrlMeaningfulString', () => {
  test('Should correctly return actual graphql meaningful string', () => {
    expect(getActualGraphqlUrlMeaningfulString('/graphql?query=1', 'Getdevoper')).toEqual(
      '/graphql/Getdevoper'
    );
  });
});
