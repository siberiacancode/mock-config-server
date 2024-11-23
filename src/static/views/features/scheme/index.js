const mediaDark = window.matchMedia('(prefers-color-scheme: dark)');

const getSavedScheme = () => {
  return localStorage.getItem('color-scheme');
};

const getSystemScheme = () => {
  const isDark = mediaDark.matches;
  const systemScheme = isDark ? 'dark' : 'light';
  return systemScheme;
};

const getCurrentScheme = () => getSavedScheme() ?? 'system';

const setSchemeStyles = (scheme) => {
  const isDark = scheme === 'dark';
  if (isDark) {
    document.documentElement.classList.remove('light_scheme');
  } else {
    document.documentElement.classList.add('light_scheme');
  }
};

const setScheme = (newScheme) => {
  let scheme = newScheme;

  const setSystemScheme = () => setScheme('system');

  if (newScheme === 'system') {
    scheme = getSystemScheme();
    mediaDark.addEventListener('change', setSystemScheme);
  } else {
    mediaDark.removeEventListener('change', setSystemScheme);
  }

  localStorage.setItem('color-scheme', newScheme);
  setSchemeStyles(scheme);
};

// eslint-disable-next-line no-unused-vars
const initScheme = () => {
  const scheme = getCurrentScheme();
  setScheme(scheme);
  return { scheme, setScheme };
};
