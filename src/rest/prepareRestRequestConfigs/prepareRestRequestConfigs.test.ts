import type { RestRequestConfig } from '../../utils/types';

import { prepareRestRequestConfigs } from './prepareRestRequestConfigs';

describe('prepareRestRequestConfigs', () => {
  test('Should not sort routes if they does not contain entities', () => {
    const RestRequestConfigs: RestRequestConfig[] = [
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
    expect(prepareRestRequestConfigs(RestRequestConfigs)).toStrictEqual(RestRequestConfigs);
  });

  test('Should sort routes by their specificity of entities', () => {
    const RestRequestConfigs: RestRequestConfig[] = [
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
    const expectedRestRequestConfigs: RestRequestConfig[] = [
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
    expect(prepareRestRequestConfigs(RestRequestConfigs)).toStrictEqual(expectedRestRequestConfigs);
  });

  test('Should set not object body weight equals to one', () => {
    const RestRequestConfigs: RestRequestConfig[] = [
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
    const expectedRestRequestConfigs: RestRequestConfig[] = [
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
    expect(prepareRestRequestConfigs(RestRequestConfigs)).toStrictEqual(expectedRestRequestConfigs);
  });
});
