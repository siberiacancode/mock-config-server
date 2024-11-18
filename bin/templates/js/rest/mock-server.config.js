import { getUserRequest, getUsersRequest, postUserRequest } from './mock-requests';

const mockServerConfig = [
  {
    port: 31299,
    baseUrl: '/'
  },
  {
    configs: [getUserRequest, getUsersRequest, postUserRequest]
  }
];

export default mockServerConfig;
