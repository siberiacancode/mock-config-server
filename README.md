# 🎉 Mock Config Server

tool that easily and quickly imitates server operation, create full fake api in few steps

## Install

Install with [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

```bash
$ npm i mock-config-server --save --dev
# or
$ yarn add mock-config-server --dev
```

## 🦉 Philosophy

**🎉 Mock Config Server** it is a tool that, easily, quickly simulates the work of a server. The main difference from solutions such as [json-server](https://www.npmjs.com/package/json-server) and [mock-service-worker](https://mswjs.io/) is the ease of filling in data and flexible emulation of any and usual cases. Our goal is to create a simple and flexible system for users, with the help of which they can create, test, and support their products.

## Features

- **TypeScript support out of the box** - full typed package
- **Full Rest Api support** - using simple configs of a certain format, you can easily simulate rest operation of servers
- **GraphQL support** - using simple configs of a certain format, you can easily simulate graphlql operation of servers
- **Database** - use mock database with all CRUD operations
- **CORS setup** - turn on and off CORS, fully customizable when CORS is turned on
- **Support for any kind of static** - server can return any type of static file if needed. Images, HTML, CSS, JSON, etc

## Usage

Install **🎉 Mock Config Server** with [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

```bash
$ npm i mock-config-server --save --dev
# or
$ yarn add mock-config-server --dev
```

Create a `mock-server.config.js` file with server configuration

```javascript
/** @type {import('mock-config-server').MockServerConfig} */
const mockServerConfig = {
  rest: {
    baseUrl: '/api',
    configs: [
      {
        path: '/user',
        method: 'get',
        routes: [{ data: { emoji: '🦁', name: 'Nursultan' } }]
      }
    ]
  }
};

export default mockServerConfig;
```

Start **🎉 Mock Config Server**

```bash
npx mock-config-server
```

> If the package is already installed you can use short command `mcs`

## 🎭 Parameters for mock-server.config.(js|ts)

- `rest?` Rest configs for mock requests
  - `baseUrl?` {string} part of the url that will be substituted at the beginning of rest request url (default: `'/'`)
  - `configs` {Array<RestRequestConfig>} configs for mock requests, [read](#configs)
  - `interceptors?` {Interceptors} functions to change request or response parameters, [read](#interceptors)
- `graphql?` GraphQL configs for mock requests
  - `baseUrl?` {string} part of the url that will be substituted at the beginning of graphql request url (default: `'/'`)
  - `configs` {Array<GraphQLRequestConfig>} configs for mock requests, [read](#configs)
  - `interceptors?` {Interceptors} functions to change request or response parameters, [read](#interceptors)
- `database?` Database config for mock requests [read](#database)
  - `data` {Object | string} initial data for database
  - `routes?` {Object | string} map of custom routes for database
- `staticPath?` {StaticPath} entity for working with static files, [read](#static-path)
- `interceptors?` {Interceptors} functions to change request or response parameters, [read](#interceptors)
- `cors?` {Cors} CORS settings object (default: `CORS is turn off`), [read](#cors)
- `port?` {number} server port (default: `31299`)
- `baseUrl?` {string} part of the url that will be substituted at the beginning of the request url (default: `'/'`)

### Configs

Configs are the fundamental part of the mock server. These configs are easy to fill and maintain. Config entities is an object with which you can emulate various application behaviors. You can specify `headers` | `cookies` | `query` | `params` | `body` for Rest request or `headers` | `cookies` | `query` | `variables` for GraphQL request to define what contract data you need to get. Using this mechanism, you can easily simulate the operation of the server and emulate various cases

##### Rest request config

- `path` {string | RegExp} request path
- `method` {GET | POST | DELETE | PUT | PATCH} rest api method
- `routes` {RestRouteConfig[]} request routes
  - `data` {any} mock data of request
  - `entities?` Object<headers | cookies | query | params | body> object that helps in data retrieval
  - `interceptors?` {Interceptors} functions to change request or response parameters, [read](#interceptors)
- `interceptors?` {Interceptors} functions to change request or response parameters, [read](#interceptors)

##### GraphQL request config

- `operationType` {query | mutation} graphql operation type
- `operationName?` {string | RegExp} graphql operation name
- `query?`: {string} graphql query as string
- `routes` {GraphQLRouteConfig[]} request routes
  - `data` {any} mock data of request
  - `entities?` Object<headers | cookies | query | variables> object that helps in data retrieval
  - `interceptors?` {Interceptors} functions to change request or response parameters, [read](#interceptors)
- `interceptors?` {Interceptors} functions to change request or response parameters, [read](#interceptors)

> Every graphql config should contain `operationName` or `query` or both of them

##### Rest example

```javascript
/** @type {import('mock-config-server').MockServerConfig} */
const mockServerConfig = {
  rest: {
    baseUrl: '/api',
    configs: [
      {
        path: '/user',
        method: 'get',
        routes: [
          {
            entities: {
              headers: { 'name-header': 'Nursultan' }
            },
            data: { emoji: '🦁', name: 'Nursultan' }
          },
          {
            entities: {
              headers: { 'name-header': 'Dmitriy' }
            },
            data: { emoji: '☄', name: 'Dmitriy' }
          }
        ]
      }
    ]
  }
};

module.exports = mockServerConfig;
```

Now you can make a request with an additional header and get the desired result

```javascript
fetch('http://localhost:31299/api/user', {
  headers: {
    'name-header': 'Nursultan',
    'Content-Type': 'application/json'
  }
})
  .then((response) => response.json())
  .then((data) => console.log(data)); // {  emoji: '🦁', name: 'Nursultan' }
```

##### GraphQL example

```javascript
/** @type {import('mock-config-server').MockServerConfig} */
const mockServerConfig = {
  graphql: {
    baseUrl: '/graphql',
    configs: [
      {
        operationType: 'query',
        operationName: 'GetUser',
        routes: [
          {
            entities: {
              headers: { 'name-header': 'Nursultan' }
            },
            data: { emoji: '🦁', name: 'Nursultan' }
          },
          {
            entities: {
              headers: { 'name-header': 'Dmitriy' }
            },
            data: { emoji: '☄', name: 'Dmitriy' }
          }
        ]
      }
    ]
  }
};

module.exports = mockServerConfig;
```

Now you can make a request with an additional header and get the desired result

```javascript
const body = JSON.stringify({
  query: 'query GetUser { name }'
});

fetch('http://localhost:31299/graphql', {
  method: 'POST',
  headers: {
    'name-header': 'Nursultan',
    'Content-Type': 'application/json'
  },
  body
})
  .then((response) => response.json())
  .then((data) => console.log(data)); // {  emoji: '🦁', name: 'Nursultan' }
```

#### Entity descriptors

If you need more complex logic for matching entities, you can use entity descriptors.
Descriptor is an object with `checkMode` and `value` fields that describe how the correctness of the actual entity is calculated.

Allowed `checkModes`

- equals - checks actual value for equality with descriptor value (default).
- notEquals - checks actual value for non-equality with descriptor value.
- exists - checks actual value for existence i.e. any value.
- notExists - checks actual value for non-existence i.e. undefined value.
- includes - checks actual value for including with descriptor value.
- notIncludes - checks actual value for non-including with descriptor value.
- startsWith - checks actual value for starting with descriptor value.
- notStartsWith - checks actual value for non-starting with descriptor value.
- endsWith - checks actual value for ending with descriptor value.
- notEndsWith - checks actual value for non-ending with descriptor value.
- regExp - checks actual value with descriptor regExp.
- function - checks actual value with descriptor function.

Value for `checkMode` except `function` | `exists` | `notExists` can be array, so you can write even more complex logic. For example "does not contain these values" or "must be match to one of these regExp".

```javascript
/** @type {import('mock-config-server').MockServerConfig} */
const mockServerConfig = {
  rest: {
    baseUrl: '/api',
    configs: [
      {
        path: '/user',
        method: 'get',
        routes: [
          {
            entities: {
              headers: {
                // 'name-header' is 'Dmitriy' or 'Nursultan'
                'name-header': {
                  checkMode: 'equals',
                  value: ['Dmitriy', 'Nursultan']
                },
                // check for 'equals' if descriptor not provided
                role: 'developer'
              },
              cookies: {
                // any 'token' cookie
                token: {
                  checkMode: 'exists'
                },
                // 'someSecretToken' cookie can be '123-abc' or 'abc-999' for example
                someSecretToken: {
                  checkMode: 'regExp',
                  value: [/^\d\d\d-abc$/, /^abc-\d\d\d$/]
                }
              }
            },
            data: 'Some user data for Dmitriy and Nursultan'
          }
        ]
      }
    ]
  }
};

module.exports = mockServerConfig;
```

Also you can use array as value for REST body and GraphQL variables entities: in this case mock-config-server will iterate
over array until `checkMode=equals` finds a match or return 404

```javascript
/** @type {import('mock-config-server').MockServerConfig} */
const mockServerConfig = {
  rest: {
    baseUrl: '/api',
    configs: [
      {
        path: '/user',
        method: 'post',
        routes: [
          {
            entities: {
              // if body equals to { key1: 'value1' } or ['value1'] then mock-config-server return data
              body: [{ key1: 'value1' }, ['value1']]
            },
            data: 'Some user data'
          }
        ]
      }
    ]
  }
};

module.exports = mockServerConfig;
```

`function checkMode` is the most powerful way to describe your `entities` logic, but in most cases you will be fine using other `checkModes`.

`Function value` has the following signature `(actualValue, checkFunction) => boolean`.
Return `true` if `actualValue` matches your logic or `false` otherwise.

You can use the `checkFunction` from second argument if you want to describe your logic in a more declarative way.
`checkFunction` has the following signature `(checkMode, actualValue, descriptorValue?) => boolean`.

##### Using descriptors for part of REST body or GraphQL variables

If you want to check a certain field of your body or variables, you can use descriptors in flatten object style. In this case server will check every field in entity with corresponding actual field.
You can use descriptors for array body elements as well.

```javascript
/** @type {import('mock-config-server').MockServerConfig} */
const mockServerConfig = {
  rest: {
    baseUrl: '/api',
    configs: [
      {
        path: '/users',
        method: 'post',
        routes: [
          {
            entities: {
              body: {
                'user.name': 'Sergey'
              }
            },
            data: 'user.name in body is "Sergey"'
          }
        ]
      },
      {
        path: '/posts',
        method: 'post',
        routes: [
          {
            entities: {
              body: {
                title: {
                  checkMode: 'startsWith',
                  value: 'A'
                }
              }
            },
            data: 'title in body starts with "A"'
          }
        ]
      },
      {
        path: '/posts',
        method: 'post',
        routes: [
          {
            entities: {
              body: [
                {
                  checkMode: 'startsWith',
                  value: 1
                },
                2
              ]
            },
            data: 'array[0] starts with "1" and array[1] equals "2"'
          }
        ]
      }
    ]
  }
};

module.exports = mockServerConfig;
```

> To enable whole body/variables checking as plain object you should use descriptor for entire body/variables.

```javascript
/** @type {import('mock-config-server').MockServerConfig} */
const mockServerConfig = {
  rest: {
    baseUrl: '/api',
    configs: [
      {
        path: '/users',
        method: 'post',
        routes: [
          {
            entities: {
              body: {
                checkMode: 'equals',
                value: {
                  user: {
                    name: 'Sergey',
                    emoji: '🐘',
                    roles: ['developer', 'moderator']
                  }
                }
              }
            },
            data: 'your body is strictly equals object from body entity value'
          }
        ]
      }
    ]
  }
};

module.exports = mockServerConfig;
```

#### Static Path

Entity for connecting statics to the server, like HTML, JSON, PNG, etc.

- `string` path to your static files
- `Object<{prefix, path}`
  - `prefix` {string} path prefix for request
  - `path` {string} path to your static files
- `Array<string | Object<{prefix, path}>>`

#### Cors

Object with settings for [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). You can flexibly configure the required origin, methods, headers, credentials, maxAge for the entire server. If you do not specify `CORS` settings, then it will be disabled.

- `origin` {string | RegExp | Array<string | RegExp> | Function | Promise } available origins from which requests can be made
- `methods?` {Array<GET | POST | DELETE | PUT | PATCH>} available methods (default: `GET,OPTIONS,PUT,PATCH,POST,DELETE`)
- `allowedHeaders?` {Array<string>} allowed headers (default: `*`)
- `exposedHeaders?` {Array<string>} exposed headers (default: `*`)
- `credentials?` {boolean} param tells browsers whether to expose the response to the frontend JavaScript code (default: `true`)
- `maxAge?` {number} how long the results can be cached (default: `3600`)

#### Interceptors

Functions to change request or response parameters

- `request?` (params) => void
- `response?` (data, params) => any

##### Request

- `params`
  - `request` request object
  - `setDelay` (delay) => Promise<void>
    - `delay` {number} milliseconds of delay time
  - `getHeader` (field) => string | number | string[] | undefined
    - `field` {string} name of response header
  - `getHeaders` () => Record<string | number | string[] | undefined>
  - `getCookie` (name) => string | undefined
    - `name` {string} name of cookie

##### Response

- `data` {any} mock data of request
- `params`
  - `request` request object
  - `response` response object
  - `setDelay` (delay) => Promise<void>
    - `delay` {number} milliseconds of delay time
  - `setStatusCode` (statusCode) => void
    - `statusCode` {number} status code for response
  - `setHeader` (field, value) => void
    - `field` {string} name of response header
    - `value` {string | string[] | undefined} value of response header
  - `appendHeader` (field, value) => void
    - `field` {string} name of response header
    - `value` {string | string[] | undefined} value of response header
  - `getHeader` (field) => string | number | string[] | undefined
    - `field` {string} name of response header
  - `getHeaders` () => Record<string | number | string[] | undefined>
  - `setCookie` (name, value, options) => void
    - `name` {string} name of cookie
    - `value` {string} value of cookie
    - `options` {[CookieOptions](https://expressjs.com/en/resources/middleware/cookie-session.html) | undefined} cookie options (like path, expires, etc.)
  - `getCookie` (name) => string | undefined
    - `name` {string} name of cookie
  - `clearCookie` (name, options) => void
    - `name` {string} name of cookie
    - `options` {[CookieOptions](https://expressjs.com/en/resources/middleware/cookie-session.html) | undefined} cookie options (like path, expires, etc.)
  - `attachment` (filename) => void
    - `filename` {string} name of file in 'Content-Disposition' header

## Database

With `mock-config-server` you can create your own mock database with all CRUD operations

- `data` {Object | string} initial data for database
- `routes?` {Object | string} map of custom routes for database

### Basic example

```javascript
const mockServerConfig = {
  database: {
    data: {
      users: [{ id: 1, name: 'John' }],
      settings: {
        blocked: false
      }
    }
  }
};
```

Now you have the following routes for requests

#### Collection routes

```
GET    /users
POST   /users
GET    /users/1
PUT    /users/1
PATCH  /users/1
DELETE /users/1
```

#### Single routes

```
GET   /settings
POST  /settings
PUT   /settings
PATCH /settings
```

> Collection routes created from arrays which all elements have **unique**(!) id. Other database parts become single routes.

Also, there are additional routes: `/__db` and `/__routes`

```
__db -> return data from database config
__routes -> return routes from database config
```

### Routes example

```javascript
const mockServerConfig = {
  database: {
    data: {
      users: [{ id: 1, name: 'John' }],
      settings: {
        blocked: false
      }
    },
    routes: {
      '/api/users/:id': '/users/:id',
      '/*/my-settings': '/settings'
    }
  }
};
```

Now following routes will work correctly

```
/api/users/1 -> return data for /users/1
/some/custom/url/my-settings -> return data for /settings
```

Note some things:

- String routes should start with forward slash
- If you want to use id param in route then use only `:id` template
- You can use `wildcard` only for custom route, **not for real route**

### File example

```javascript
const mockServerConfig = {
  database: {
    data: './data.json',
    routes: './routes.json'
  }
};
```

Instead of objects you can use paths to **JSON** files which contain needed data or routes

## CLI usage

```
mcs [options]

Options:
  --baseUrl, -b         Set base url (default: '/')
  --port, -p            Set port (default: 31299)
  --staticPath, -s      Set static path
  --config, -c          Set path to config file (default: './mock-server.config.(?:ts|mts|cts|js|mjs|cjs)')
  --watch, -w           Enables server restart after config file changes (default: false)

  --version, -v         Show version number
  --help, -h            Show help

Examples:
  mcs --baseurl /base/url --port 3000 --config ./path/to/config.ts -w
  mcs --help
```

## ✨ Contributors

<table>
<tr>
    <td align="center" style="word-wrap: break-word; width: 100.0; height: 100.0">
        <a href="https://github.com/debabin">
            <img src="https://avatars.githubusercontent.com/u/45297354?v=4"
            width="100;"  
            alt="debabin" />
            <br />
            <sub style="font-size:13px"><b>☄️ debabin</b></sub>
        </a>
    </td>
    <td align="center" style="word-wrap: break-word; width: 100.0; height: 100.0">
        <a href="https://github.com/MiaInturi">
            <img src="https://avatars.githubusercontent.com/u/39031929?v=4"
            width="100;"  
            alt="MiaInturi" />
            <br />
            <sub style="font-size:13px"><b>👹 MiaInturi</b></sub>
        </a>
    </td>
      <td align="center" style="word-wrap: break-word; width: 100.0; height: 100.0">
        <a href="https://github.com/RiceWithMeat">
            <img src="https://avatars.githubusercontent.com/u/47690223?v=4"
            width="100;"  
            alt="RiceWithMeat" />
            <br />
            <sub style="font-size:13px"><b>🐘 RiceWithMeat</b></sub>
        </a>
    </td>
    <td align="center" style="word-wrap: break-word; width: 100.0; height: 100.0">
        <a href="https://github.com/anv296">
            <img src="https://avatars.githubusercontent.com/u/39154399?s=400&u=7c4fcc6d120f4b13ccbd03a9a384622b6523c376&v=4"
            width="100;"  
            alt="anv296" />
            <br />
            <sub style="font-size:13px"><b>🎱️ anv296</b></sub>
        </a>
    </td>
  </tr>
</table>
