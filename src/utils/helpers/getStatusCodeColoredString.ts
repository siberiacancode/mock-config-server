import color from 'ansi-colors';

export const getStatusCodeColoredString = (statusCode: number) => {
  const statusCodeString = statusCode.toString();
  if (statusCode >= 100 && statusCode < 200) return color.white(statusCodeString);
  if (statusCode >= 200 && statusCode < 300) return color.green(statusCodeString);
  if (statusCode >= 300 && statusCode < 400) return color.yellow(statusCodeString);
  if (statusCode >= 400 && statusCode < 500) return color.red(statusCodeString);
  if (statusCode >= 500 && statusCode < 600) return color.redBright(statusCodeString);
};
