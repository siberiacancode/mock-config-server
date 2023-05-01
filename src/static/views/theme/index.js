const lightStyles = document.querySelectorAll('link[rel=stylesheet][media*=prefers-color-scheme][media*=light]');
const darkStyles = document.querySelectorAll('link[rel=stylesheet][media*=prefers-color-scheme][media*=dark]');

function getSavedScheme() {
    return localStorage.getItem('color-scheme');
}

function switchMedia(scheme) {
    const lightMedia = (scheme === 'light') ? 'all' : 'not all';
    const darkMedia = (scheme === 'dark') ? 'all' : 'not all';

    [...lightStyles].forEach((link) => {
        link.media = lightMedia;
    });

    [...darkStyles].forEach((link) => {
        link.media = darkMedia;
    });
}

function saveScheme(scheme) {
    localStorage.setItem('color-scheme', scheme);
}

function setScheme(scheme) {
    switchMedia(scheme);
    saveScheme(scheme);
}

function setupScheme() {
    const savedScheme = getSavedScheme() ?? 'dark';

    setScheme(savedScheme);
}

function switchScheme() {
    if (getSavedScheme() === 'light') setScheme("dark");
    else setScheme("light");
}

setupScheme();

