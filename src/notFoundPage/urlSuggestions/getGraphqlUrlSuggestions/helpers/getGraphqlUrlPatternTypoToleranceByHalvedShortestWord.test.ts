import { getGraphqlUrlPatternTypoToleranceByHalvedShortestWord } from './getGraphqlUrlPatternTypoToleranceByHalvedShortestWord';

describe('getGraphqlUrlPatternTypoToleranceByHalvedShortestWord', () => {
  test('Should correct return typo tolerance', () => {
    expect(
      getGraphqlUrlPatternTypoToleranceByHalvedShortestWord([
        'graphqlqueryGetPosts',
        'graphqlqueryGetDevelopers'
      ])
    ).toEqual(10);
  });
});
