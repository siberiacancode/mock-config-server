import { createUserMutation, getUserQuery, getUsersQuery } from './mock-requests';

const mockServerConfig = [
  {
    port: 31299,
    baseUrl: '/graphql'
  },
  {
    configs: [getUserQuery, getUsersQuery, createUserMutation]
  }
];

export default mockServerConfig;
