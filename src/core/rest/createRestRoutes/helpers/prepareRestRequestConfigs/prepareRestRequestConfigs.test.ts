import type { RestRequestConfig } from '@/utils/types';

import { prepareRestRequestConfigs } from './prepareRestRequestConfigs';

describe('prepareRestRequestConfigs', () => {
  test('Should not sort routes if they does not contain entities', () => {
    const restRequestConfigs: RestRequestConfig[] = [
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
    expect(prepareRestRequestConfigs(restRequestConfigs)).toStrictEqual(restRequestConfigs);
  });

  test('Should sort routes by their specificity of entities', () => {
    const restRequestConfigs: RestRequestConfig[] = [
      {
        path: '/user',
        method: 'get',
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
    const expectedRestRequestConfigs: RestRequestConfig[] = [
      {
        path: '/user',
        method: 'get',
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
    expect(prepareRestRequestConfigs(restRequestConfigs)).toStrictEqual(expectedRestRequestConfigs);
  });

  test('Should set not object body weight equals to one', () => {
    const restRequestConfigs: RestRequestConfig[] = [
      {
        path: '/user',
        method: 'post',
        routes: [
          {
            entities: {
              body: {
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
    const expectedRestRequestConfigs: RestRequestConfig[] = [
      {
        path: '/user',
        method: 'post',
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
              body: {
                checkMode: 'equals',
                value: ['value', 'value', 'value']
              }
            },
            data: { name: 'John', surname: 'Doe' }
          }
        ]
      }
    ];
    expect(prepareRestRequestConfigs(restRequestConfigs)).toStrictEqual(expectedRestRequestConfigs);
  });
});
