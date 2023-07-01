const lightStyles = document.querySelector(
  'link[rel=stylesheet][media*=prefers-color-scheme][media*=light]'
);
const darkStyles = document.querySelector(
  'link[rel=stylesheet][media*=prefers-color-scheme][media*=dark]'
);

function getSavedScheme() {
  return localStorage.getItem('color-scheme');
}

function setScheme(scheme) {
  const lightMedia = scheme === 'light' ? 'all' : 'not all';
  const darkMedia = scheme === 'dark' ? 'all' : 'not all';

  lightStyles.media = lightMedia;
  darkStyles.media = darkMedia;

  localStorage.setItem('color-scheme', scheme);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function switchScheme() {
  setScheme(getSavedScheme() === 'light' ? 'dark' : 'light');
}

function initScheme() {
  setScheme(getSavedScheme() ?? 'dark');
}

initScheme();
