import { Request, Response } from 'express';

import { getUrlSuggestions } from '../utils/helpers';

export const notFoundMiddleware = (configPaths: string[]) => (req: Request, res: Response) => {
  // ✅ important: pass url with query params
  const urlSuggestions = getUrlSuggestions(req.originalUrl, configPaths);

  const urlSuggestionsFragment = urlSuggestions.length
    ? `
      <div>
        <h2>This list contains similar urls, maybe you will find a right one!</h2>
        <ul>
          ${urlSuggestions
            .map((urlSuggestion) => `<li><a href=${urlSuggestion}>${urlSuggestion}</a></li>`)
            .join('')}
        </ul>
        <div>If not, next list contains all paths from your config. See you soon! 🤓</div>
      </div>
    `
    : '';

  res.status(404).send(`
        <h1>Whoops... 404 ☹️</h1>
        <div>Welcome back! Seems to be your config does not have '${
          req.path
        }' path, or you have typo in it.</div>
        <div>Check your url or go to one of the next urls</div>
        ${urlSuggestionsFragment}
        <div>
          <h2>Your config have the following paths:</h2>
          <ul>
            ${configPaths.map((path) => `<li><a href=${path}>${path}</a></li>`).join('')}
          </ul>
        </div>
    `);
};
