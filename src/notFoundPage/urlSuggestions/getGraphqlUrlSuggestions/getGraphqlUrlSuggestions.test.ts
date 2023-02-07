import { getGraphqlUrlSuggestions } from './getGraphqlUrlSuggestions';

describe('getGraphqlUrlSuggestions', () => {
  const patternOperationNames: string[] = ['GetPosts', 'GetDevelopers', 'CreateDeveloper'];

  test('Should return only exact match if typoTolerance is 0', () => {
    expect(
      getGraphqlUrlSuggestions({
        query: {
          url: '/',
          operationName: 'GetPosts'
        },
        patternOperationNames,
        typoTolerance: 0
      })
    ).toEqual(['/GetPosts']);

    expect(
      getGraphqlUrlSuggestions({
        query: {
          url: '/',
          operationName: 'GetPots'
        },
        patternOperationNames,
        typoTolerance: 0
      })
    ).toEqual([]);
  });

  test('Should correctly return suggestions if typoTolerance is 1', () => {
    expect(
      getGraphqlUrlSuggestions({
        query: {
          url: '/',
          operationName: 'GetPots'
        },
        patternOperationNames,
        typoTolerance: 1
      })
    ).toEqual(['/GetPosts']);

    expect(
      getGraphqlUrlSuggestions({
        query: {
          url: '/',
          operationName: 'Getpots'
        },
        patternOperationNames,
        typoTolerance: 1
      })
    ).toEqual([]);
  });

  test('Should return all patterns with same number of parts if typoTolerance is Infinity', () => {
    expect(
      getGraphqlUrlSuggestions({
        query: {
          url: '/bas/graph',
          operationName: 'getpts'
        },
        patternOperationNames,
        typoTolerance: Infinity
      })
    ).toEqual(['/GetPosts', '/GetDevelopers', '/CreateDeveloper']);
  });

  test('Should correctly return suggestions if typoTolerance is halvedShortestWord', () => {
    expect(
      getGraphqlUrlSuggestions({
        query: {
          url: '/',
          operationName: 'Getdevoper'
        },
        patternOperationNames,
        typoTolerance: 'halvedShortestWord'
      })
    ).toEqual(['/GetDevelopers']);

    expect(
      getGraphqlUrlSuggestions({
        query: {
          url: '/',
          operationName: 'Getdevope'
        },
        patternOperationNames,
        typoTolerance: 'halvedShortestWord'
      })
    ).toEqual([]);
  });

  test('Should correctly return suggestions with base urls if base urls are provided', () => {
    expect(
      getGraphqlUrlSuggestions({
        query: {
          url: '/base/graphql',
          operationName: 'GetPosts'
        },
        patternOperationNames,
        typoTolerance: 0,
        serverBaseUrl: '/base',
        graphqlBaseUrl: 'graphql'
      })
    ).toEqual(['/base/graphql/GetPosts']);
  });
});
