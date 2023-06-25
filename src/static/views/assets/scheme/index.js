const lightStyles = document.querySelector(
  'link[rel=stylesheet][media*=prefers-color-scheme][media*=light]'
);
const darkStyles = document.querySelector(
  'link[rel=stylesheet][media*=prefers-color-scheme][media*=dark]'
);

const getSavedScheme = () => localStorage.getItem('color-scheme');

const setScheme = (scheme) => {
  const lightMedia = scheme === 'light' ? 'all' : 'not all';
  const darkMedia = scheme === 'dark' ? 'all' : 'not all';

  lightStyles.media = lightMedia;
  darkStyles.media = darkMedia;

  localStorage.setItem('color-scheme', scheme);
};

const switchScheme = () => setScheme(getSavedScheme() === 'light' ? 'light' : 'dark');

const initScheme = () => setScheme(getSavedScheme() ?? 'dark');

initScheme();
