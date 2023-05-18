type Cookies = Record<string, string>;

export const parseCookie = (cookieHeader: string) => {
  if (!cookieHeader) return {};

  const cookies = {} as Cookies;
  const cookiePairs = cookieHeader.split('; ');
  cookiePairs.forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');

    if (!name) return;
    cookies[name.trim()] = value?.trim() ?? '';
  });

  return cookies;
};
