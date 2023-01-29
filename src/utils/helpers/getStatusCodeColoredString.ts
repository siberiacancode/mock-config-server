import c from 'ansi-colors';

export const getStatusCodeColoredString = (statusCode: number) => {
  const statusCodeString = statusCode.toString();
  // Informational
  if (statusCode >= 100 && statusCode < 200) return c.white(statusCodeString);
  // Successful
  if (statusCode >= 200 && statusCode < 300) return c.green(statusCodeString);
  // Redirection
  if (statusCode >= 300 && statusCode < 400) return c.yellow(statusCodeString);
  // Client error
  if (statusCode >= 400 && statusCode < 500) return c.red(statusCodeString);
  // Server error
  if (statusCode >= 500 && statusCode < 600) return c.redBright(statusCodeString);
};
