import { createUserMutation, getUserQuery, getUsersQuery } from './mock-requests';

const restMockServerConfig = {
  port: 31299,
  baseUrl: '/',
  configs: [getUserQuery, getUsersQuery, createUserMutation]
};

export default restMockServerConfig;
