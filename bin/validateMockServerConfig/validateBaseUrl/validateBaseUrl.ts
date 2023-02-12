export const validateBaseUrl = (baseUrl: unknown) => {
  if (typeof baseUrl !== 'string' && typeof baseUrl !== 'undefined') {
    throw new Error('baseUrl');
  }
};
