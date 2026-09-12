import { mock, rest } from 'mock-config-server';

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
    name: 'rest',
    configs: [
      rest.get('/users', () => users),
      rest.get<{ params: { id: string } }>('/users/:id', (params) => {
        const user = users[Number(params.request.params.id) - 1];
        if (!user) {
          params.setStatusCode(404);
          return { error: 'Not found' };
        }
        return user;
      }),
      rest.post<{ body: User }>('/users', (params) => {
        const user = params.request.body;
        users.push(user);
        return user;
      }),
      rest.put<{ params: { id: string }; body: User }>('/users/:id', (params) => {
        const user = params.request.body;
        users[Number(params.request.params.id) - 1] = user;
        return user;
      }),
      rest.delete<{ params: { id: string } }>('/users/:id', (params) => {
        users.splice(Number(params.request.params.id) - 1, 1);
        return { ok: true };
      })
    ]
  }
);
