export const validatePort = (port: unknown) => {
  if (typeof port !== 'number' && typeof port !== 'undefined') {
    throw new Error('port');
  }
};
