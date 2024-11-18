import { createUserMutation, getUserQuery, getUsersQuery } from './mock-requests/graphql';
import { getUserRequest, getUsersRequest, postUserRequest } from './mock-requests/rest';

const mockServerConfig = [
  {
    port: 31299,
    baseUrl: '/'
  },
  {
    configs: [getUserRequest, getUsersRequest, postUserRequest]
  },
  {
    baseUrl: '/graphql',
    configs: [getUserQuery, getUsersQuery, createUserMutation]
  }
];

export default mockServerConfig;
