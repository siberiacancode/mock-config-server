const lightStyles = document.querySelector(
  'link[rel=stylesheet][media*=prefers-color-scheme][media*=light]'
);
const darkStyles = document.querySelector(
  'link[rel=stylesheet][media*=prefers-color-scheme][media*=dark]'
);
const mediaDark = window.matchMedia('(prefers-color-scheme: dark)');

function getSavedScheme() {
  return localStorage.getItem('color-scheme');
}

function getSystemScheme() {
  const isDark = mediaDark.matches;
  const systemScheme = isDark ? 'dark' : 'light';
  return systemScheme;
}

function setSchemeMedia(scheme) {
  const lightMedia = scheme === 'light' ? 'all' : 'not all';
  const darkMedia = scheme === 'dark' ? 'all' : 'not all';

  lightStyles.media = lightMedia;
  darkStyles.media = darkMedia;
}

function setScheme(newScheme) {
  let scheme = newScheme;

  if (newScheme === 'system') {
    scheme = getSystemScheme();
    mediaDark.addEventListener('change', () => setScheme('system'));
  } else mediaDark.removeEventListener('change', () => setScheme('system'));

  localStorage.setItem('color-scheme', newScheme);
  setSchemeMedia(scheme);
}

// eslint-disable-next-line no-unused-vars
function initScheme() {
  const scheme = getSavedScheme() ?? 'system';
  setScheme(scheme);
  return { scheme, setScheme };
}
