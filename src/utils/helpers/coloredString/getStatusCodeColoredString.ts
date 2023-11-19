import c from 'ansi-colors';

export const getStatusCodeColoredString = (statusCode: number) => {
  const statusCodeString = statusCode.toString();
  if (statusCode >= 100 && statusCode < 200) return c.white(statusCodeString);
  if (statusCode >= 200 && statusCode < 300) return c.green(statusCodeString);
  if (statusCode >= 300 && statusCode < 400) return c.yellow(statusCodeString);
  if (statusCode >= 400 && statusCode < 500) return c.red(statusCodeString);
  if (statusCode >= 500 && statusCode < 600) return c.redBright(statusCodeString);
  throw new Error('Wrong statusCode');
};
