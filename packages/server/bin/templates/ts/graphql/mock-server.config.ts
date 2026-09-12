import { graphql, mock } from 'mock-config-server';

interface User {
  emoji: string;
  name: string;
}

interface Error {
  error: string;
}

const users: User[] = [
  { emoji: '🍎', name: 'Alice' },
  { emoji: '🍌', name: 'Bob' },
  { emoji: '🍒', name: 'Carol' },
  { emoji: '🍇', name: 'Dan' },
  { emoji: '🥝', name: 'Eve' }
];

export default mock(
  { port: 7777, baseUrl: '/' },
  {
    name: 'graphql',
    baseUrl: '/graphql',
    configs: [
      graphql.query('GetUsers', { data: { users } }),
      graphql.query<{ data: Error | User }, { body: { variables: { id: string } } }>(
        'GetUser',
        (params) => {
          const user = users[Number(params.request.body.variables.id) - 1];
          if (!user) {
            params.setStatusCode(404);
            return { data: { error: 'Not found' } };
          }
          return { data: user };
        }
      )
    ]
  }
);
