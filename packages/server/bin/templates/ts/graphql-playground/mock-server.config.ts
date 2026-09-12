import { graphql, mock } from 'mock-config-server';

interface User {
  emoji: string;
  name: string;
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
      graphql.query('GetUsers', () => ({ data: { users } })),
      graphql.query<{ body: { variables: { id: string } } }>('GetUser', (params) => {
        const id = params.request.body.variables.id;
        const user = users[Number(id) - 1];
        if (!user) {
          params.setStatusCode(404);
          return { data: { error: 'Not found' } };
        }
        return { data: user };
      }),
      graphql.mutation<{ body: { variables: User } }>('CreateUser', (params) => {
        const user = params.request.body.variables;
        users.push(user);
        return { data: user };
      }),
      graphql.mutation<{ body: { variables: User & { id: string } } }>('ChangeUser', (params) => {
        const { id, ...user } = params.request.body.variables;
        users[Number(id) - 1] = user;
        return { data: user };
      }),
      graphql.mutation<{ body: { variables: { id: string } } }>('DeleteUser', (params) => {
        users.splice(Number(params.request.body.variables.id) - 1, 1);
        return { data: { deleted: true } };
      })
    ]
  }
);
