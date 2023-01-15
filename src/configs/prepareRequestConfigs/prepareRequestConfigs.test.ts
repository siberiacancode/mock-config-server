import type { RequestConfig } from '../../utils/types';

import { prepareRequestConfigs } from './prepareRequestConfigs';

describe('prepareRequestConfigs', () => {
  test('Should not sort routes if they does not contain entities', () => {
    const requestConfigs: RequestConfig[] = [
      {
        path: '/user',
        method: 'get',
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
    expect(prepareRequestConfigs(requestConfigs)).toStrictEqual(requestConfigs);
  });

  test('Should sort routes by their specificity of entities', () => {
    const requestConfigs: RequestConfig[] = [
      {
        path: '/user',
        method: 'get',
        routes: [
          {
            entities: {
              headers: {
                header1: 'value'
              }
            },
            data: { name: 'John', surname: 'Doe' }
          },
          {
            entities: {
              headers: {
                header1: 'value',
                header2: 'value'
              }
            },
            data: { name: 'John', surname: 'Doe' }
          },
          {
            entities: {
              headers: {
                header1: 'value'
              },
              query: {
                query1: 'value',
                query2: 'value'
              }
            },
            data: { name: 'John', surname: 'Doe' }
          }
        ]
      }
    ];
    const expectedRequestConfigs: RequestConfig[] = [
      {
        path: '/user',
        method: 'get',
        routes: [
          {
            entities: {
              headers: {
                header1: 'value'
              },
              query: {
                query1: 'value',
                query2: 'value'
              }
            },
            data: { name: 'John', surname: 'Doe' }
          },
          {
            entities: {
              headers: {
                header1: 'value',
                header2: 'value'
              }
            },
            data: { name: 'John', surname: 'Doe' }
          },
          {
            entities: {
              headers: {
                header1: 'value'
              }
            },
            data: { name: 'John', surname: 'Doe' }
          }
        ]
      }
    ];
    expect(prepareRequestConfigs(requestConfigs)).toStrictEqual(expectedRequestConfigs);
  });

  test('Should set not object body weight equals to one', () => {
    const requestConfigs: RequestConfig[] = [
      {
        path: '/user',
        method: 'post',
        routes: [
          {
            entities: {
              body: ['value', 'value', 'value']
            },
            data: { name: 'John', surname: 'Doe' }
          },
          {
            entities: {
              headers: {
                header1: 'value',
                header2: 'value'
              }
            },
            data: { name: 'John', surname: 'Doe' }
          }
        ]
      }
    ];
    const expectedRequestConfigs: RequestConfig[] = [
      {
        path: '/user',
        method: 'post',
        routes: [
          {
            entities: {
              headers: {
                header1: 'value',
                header2: 'value'
              }
            },
            data: { name: 'John', surname: 'Doe' }
          },
          {
            entities: {
              body: ['value', 'value', 'value']
            },
            data: { name: 'John', surname: 'Doe' }
          }
        ]
      }
    ];
    expect(prepareRequestConfigs(requestConfigs)).toStrictEqual(expectedRequestConfigs);
  });
});
