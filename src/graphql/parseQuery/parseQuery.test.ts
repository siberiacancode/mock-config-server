import { parseQuery } from './parseQuery';

describe('parseQuery', () => {
  test('Should parse graphQL query', async () => {
    const parsedQuery = parseQuery('query GetCharacters { characters { name } }');

    expect(parsedQuery).toStrictEqual({
      operationType: 'query',
      operationName: 'GetCharacters'
    });
  });

  test('Should parse graphQL mutation', async () => {
    const parsedQuery = parseQuery(
      'mutation CreateCharacters($name: String!) { createCharacters(name: $name) { name } }'
    );

    expect(parsedQuery).toStrictEqual({
      operationType: 'mutation',
      operationName: 'CreateCharacters'
    });
  });
});
