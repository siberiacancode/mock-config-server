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
- **Full Rest Api support** - using simple configs of a certain format, you can easily simulate the operation of servers
- **CORS setup** - turn on and off CORS, fully customizable when CORS is turned on
- **Support for any kind of static** - server can return any type of static file if needed. Images, HTML, CSS, JSON, etc

## Usage

Install **🎉 Mock Config Server** with [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

```bash
$ npm i mock-server --save --dev
# or
$ yarn add mock-server --dev
```

Create a `mock-server.config.js` file with server configuration

```javascript
/** @type {import('mock-server').Mock.ServerConfig} */
const mockServerConfig: Mock.ServerConfig = {
  configs: [
    {
      path: '/user',
      method: 'get',
      routes: [{ data: { emoji: '🦁', name: 'Nursultan' } }]
    }
  ]
};

module.exports = mockServerConfig;
```

Start **🎉 Mock Config Server**

```bash
$ mock-config-server

# 🎉 Mock Config Server is running at http://localhost:31299
```

## 🎭 Parameters for mock-server.config.(js|ts)

- `configs` {Array<RequestConfig>} configs for mock requests, [read](#configs)
- `staticPath?` {StaticPath} entity for working with static files, [read](#static-path)
- `interceptors?` {Interceptors} functions to change request or response parameters, [read](#interceptors)
- `cors?` {Cors} CORS settings object (default: `CORS is turn off`), [read](#cors)
- `port?` {number} server port (default: `31299`)
- `baseUrl?` {string} part of the url that will be substituted at the beginning of the request url (default: `'/'`)

### Configs

Configs are the fundamental part of the mock server. These configs are easy to fill and maintain. Config entities is an object with which you can emulate various application behaviors. You can specify `headers` | `query` | `params` | `body` to define what contract data you need to get. Using this mechanism, you can easily simulate the operation of the server and emulate various cases

##### request config

- `path` {string | RegExp} request path
- `method` {GET | POST | DELETE | PUT | PATCH} rest api method
- `routes` {RouteConfig} request routes
- `interceptors?` {Interceptors} functions to change request or response parameters, [read](#interceptors)

##### route config

- `data` {any} mock data of request
- `entities?` Object<headers | query | params | body> object that helps in data retrieval
- `interceptors?` {Interceptors} functions to change request or response parameters, [read](#interceptors)

##### entities

```typescript
interface Entities {
  headers?: { [string]: string | number };
  query?: { [string]: string | number };
  params?: { [string]: string | number };
  body?: any;
}
```

##### Example

```javascript
/** @type {import('mock-config-server').MockServerConfig} */
const mockServerConfig = {
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
};

module.exports = mockServerConfig;
```

Now you can make a request with an additional header and get the desired result

```javascript
fetch('http://localhost:31299/user', {
  headers: { 'name-header': 'Nursultan' }
})
  .then((response) => response.json())
  .then((data) => console.log(data)); // {  emoji: '🦁', name: 'Nursultan' }
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
- `methods?` {Array<GET | POST | DELETE | PUT | PATCH>} available methods (default: `*`)
- `headers?` {Array<string>} available methods (default: `*`)
- `credentials?` {boolean} param tells browsers whether to expose the response to the frontend JavaScript code (default: `true`)
- `maxAge?` {number} how long the results can be cached (default: `3600`)

#### Interceptors

Functions to change request or response parameters

- `request?` (params) => void
- `response?` (data, params) => any

##### Request

- `params`
  - `request` request object

##### Response

- `data` {any} mock data of request
- `params`
  - `request` request object
  - `response` response object
  - `setDelay` (delay) => Promise<void>
    - `delay` {number} seconds of delay time
  - `setStatusCode` (statusCode) => void
    - `statusCode` {number} status code for response

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
  </tr>
</table>
