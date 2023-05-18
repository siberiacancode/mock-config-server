type Cookies = Record<string, string>;

export const parseCookie = (cookieHeader: string | string[]) => {
  if (!cookieHeader) return {};

  const cookieString = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : cookieHeader;

  const cookies = {} as Cookies;
  const cookiePairs = cookieString.split('; ');
  cookiePairs.forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');

    if (!name) return;
    cookies[name.trim()] = value?.trim() ?? '';
  });

  return cookies;
};
