type Cookies = Record<string, string>;
export const parseCookie = (cookie: string) => {
  const cookies = {} as Cookies;
  const array = cookie.split(';');

  array.forEach((cookie) => {
    const [key, value] = cookie.trim().split('=');
    cookies[key] = value;
  });

  return cookies;
};
