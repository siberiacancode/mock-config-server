export const DEFAULT = {
  PORT: 31299,
  CORS: {
    ORIGIN: '*',
    METHODS: 'GET,OPTIONS,PUT,PATCH,POST,DELETE',
    ALLOWED_HEADERS: '*',
    EXPOSED_HEADERS: '*',
    CREDENTIALS: true,
    MAX_AGE: 3600
  }
};
