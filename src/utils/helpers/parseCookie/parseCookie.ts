type Cookies = Record<string, string>;
export const parseCookie = (cookieHeader: string) => {
  const cookies = {} as Cookies;
  const cookiePairs = cookieHeader.split(';');

  cookiePairs.forEach((cookie) => {
    const [key, value] = cookie.trim().split('=');
    cookies[key] = value;
  });

  return cookies;
};
