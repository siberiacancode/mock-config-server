const { startMockServer } = require('./dist');

/** @type {import('./dist').MockServerConfig} */
const mock = {
  cors: {
    origin: '*'
  },
  // interceptors: {
  //   request: async ({ request, setDelay, getHeader, getHeaders }) => {
  //     await setDelay(1000);
  //     return request;
  //   },
  //   response: (data, {}) => {
  //     console.log('@', data);
  //     return data;
  //   }
  // },
  rest: {
    baseUrl: '/api',
    // interceptors: {
    //   request: async ({ request, getCookie }) => {
    //     getCookie('test');
    //     return request;
    //   },
    //   response: (data, {}) => {
    //     return data;
    //   }
    // },
    interceptors: {
      response: (data, { response }) => {
        console.log('response', response.path);
        return { api: data };
      }
    },
    configs: [
      {
        path: '/user',
        method: 'get',
        routes: [
          {
            data: null,
            interceptors: {
              response: (data, { setStatusCode }) => {
                setStatusCode(404);
                return { route: data };
              }
            }
          }
        ],
        interceptors: {
          response: (data, { response, request, getHeader, getHeaders, getCookie }) => {
            console.log('@', getCookie('name'));
            return { request: data };
          }
        }
      }
    ]
  }
};

startMockServer(mock);

// get/post array, get/delete/put/patch item
const database = {
  data: {
    users: [{ id: 1, name: 'dima' }],
    cars: [{ id: 1, brand: 'bmw' }]
  },
  routes: {
    '/cars/userId/carId': '/cars/',
    '/cars/userId': '/cars'
  }
};

const routes = {
  '/cars/userId/carId': { entity: 'cars', by: 'id' },
  '/cars/userId': '/cars'
};
