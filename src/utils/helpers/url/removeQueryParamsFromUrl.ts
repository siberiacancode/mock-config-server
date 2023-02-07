export const removeQueryParamsFromUrl = (url: string) => {
  const [urlWithoutQueryParams] = url.split('?');
  return urlWithoutQueryParams;
};
