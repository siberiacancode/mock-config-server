import type { GraphQLRequestConfig } from '@/utils/types';

import { prepareGraphQLRequestConfigs } from './prepareGraphQLRequestConfigs';

describe('prepareGraphQLRequestConfigs', () => {
  test('Should not sort routes if they does not contain entities', () => {
    const GraphQLRequestConfigs: GraphQLRequestConfig[] = [
      {
        operationName: 'GetUser',
        operationType: 'query',
        routes: [
          {
            data: { name: 'John', surname: 'Doe' }
          },
          {
            data: { name: 'John', surname: 'Smith' }
          },
          {
            data: { name: 'John', surname: 'John' }
          }
        ]
      }
    ];
    expect(prepareGraphQLRequestConfigs(GraphQLRequestConfigs)).toStrictEqual(
      GraphQLRequestConfigs
    );
  });

  test('Should sort routes by their specificity of entities', () => {
    const GraphQLRequestConfigs: GraphQLRequestConfig[] = [
      {
        operationName: 'GetUser',
        operationType: 'query',
        routes: [
          {
            entities: {
              headers: {
                header1: {
                  checkMode: 'equals',
                  value: 'value'
                }
              }
            },
            data: { name: 'John', surname: 'Doe' }
          },
          {
            entities: {
              headers: {
                header1: {
                  checkMode: 'equals',
                  value: 'value'
                },
                header2: {
                  checkMode: 'equals',
                  value: 'value'
                }
              }
            },
            data: { name: 'John', surname: 'Doe' }
          },
          {
            entities: {
              headers: {
                header1: {
                  checkMode: 'equals',
                  value: 'value'
                }
              },
              query: {
                query1: {
                  checkMode: 'equals',
                  value: 'value'
                },
                query2: {
                  checkMode: 'equals',
                  value: 'value'
                }
              }
            },
            data: { name: 'John', surname: 'Doe' }
          }
        ]
      }
    ];
    const expectedGraphQLRequestConfigs: GraphQLRequestConfig[] = [
      {
        operationName: 'GetUser',
        operationType: 'query',
        routes: [
          {
            entities: {
              headers: {
                header1: {
                  checkMode: 'equals',
                  value: 'value'
                }
              },
              query: {
                query1: {
                  checkMode: 'equals',
                  value: 'value'
                },
                query2: {
                  checkMode: 'equals',
                  value: 'value'
                }
              }
            },
            data: { name: 'John', surname: 'Doe' }
          },
          {
            entities: {
              headers: {
                header1: {
                  checkMode: 'equals',
                  value: 'value'
                },
                header2: {
                  checkMode: 'equals',
                  value: 'value'
                }
              }
            },
            data: { name: 'John', surname: 'Doe' }
          },
          {
            entities: {
              headers: {
                header1: {
                  checkMode: 'equals',
                  value: 'value'
                }
              }
            },
            data: { name: 'John', surname: 'Doe' }
          }
        ]
      }
    ];
    expect(prepareGraphQLRequestConfigs(GraphQLRequestConfigs)).toStrictEqual(
      expectedGraphQLRequestConfigs
    );
  });

  test('Should set not object variables weight equals to one', () => {
    const GraphQLRequestConfigs: GraphQLRequestConfig[] = [
      {
        operationName: 'GetUser',
        operationType: 'query',
        routes: [
          {
            entities: {
              variables: {
                checkMode: 'equals',
                value: ['value', 'value', 'value']
              }
            },
            data: { name: 'John', surname: 'Doe' }
          },
          {
            entities: {
              headers: {
                header1: {
                  checkMode: 'equals',
                  value: 'value'
                },
                header2: {
                  checkMode: 'equals',
                  value: 'value'
                }
              }
            },
            data: { name: 'John', surname: 'Doe' }
          }
        ]
      }
    ];
    const expectedGraphQLRequestConfigs: GraphQLRequestConfig[] = [
      {
        operationName: 'GetUser',
        operationType: 'query',
        routes: [
          {
            entities: {
              headers: {
                header1: {
                  checkMode: 'equals',
                  value: 'value'
                },
                header2: {
                  checkMode: 'equals',
                  value: 'value'
                }
              }
            },
            data: { name: 'John', surname: 'Doe' }
          },
          {
            entities: {
              variables: {
                checkMode: 'equals',
                value: ['value', 'value', 'value']
              }
            },
            data: { name: 'John', surname: 'Doe' }
          }
        ]
      }
    ];
    expect(prepareGraphQLRequestConfigs(GraphQLRequestConfigs)).toStrictEqual(
      expectedGraphQLRequestConfigs
    );
  });
});
