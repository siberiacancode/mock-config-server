export const validateBaseUrl = (baseUrl: unknown) => {
  if (typeof baseUrl !== 'string' && typeof baseUrl !== 'undefined') {
    throw new Error('baseUrl');
  }
  if (typeof baseUrl === 'string' && !baseUrl.startsWith('/')) {
    throw new Error('baseUrl');
  }
};
