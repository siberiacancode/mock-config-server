import type { RestMethod } from '../utils/types';

interface GetNotFoundPageParams {
  requestMethod: RestMethod;
  url: string;
  restUrlSuggestions: string[];
  graphqlUrlSuggestions: string[];
}

const getRestUrlSuggestionsFragment = (restUrlSuggestions: string[]) => {
  if (!restUrlSuggestions.length) return '';
  return `
    <div>
      <h3>REST</h3>
      <ul>
        ${restUrlSuggestions
          .map(
            (restUrlSuggestion) => `
        <li><a href=${restUrlSuggestion}>${decodeURIComponent(restUrlSuggestion)}</a></li>`
          )
          .join('')}
      </ul>
    </div>
  `;
};

const getGraphqlUrlSuggestionsFragment = (graphqlUrlSuggestions: string[]) => {
  if (!graphqlUrlSuggestions.length) return '';
  return `
    <div>
      <h3>GraphQL</h3>
      <ul>
        ${graphqlUrlSuggestions
          .map(
            (graphqlUrlSuggestion) => `
        <li>${decodeURIComponent(graphqlUrlSuggestion)}</li>`
          )
          .join('')}
      </ul>
    </div>
  `;
};

export const getNotFoundPage = ({
  requestMethod,
  url,
  restUrlSuggestions,
  graphqlUrlSuggestions
}: GetNotFoundPageParams) => {
  const isSuggestionsShown = restUrlSuggestions.length || graphqlUrlSuggestions.length;

  return `
    <h1>404</h1>
    <div>
      Seems to be your config does not have data for '${requestMethod} ${decodeURIComponent(
    url
  )} request, or you have typo in it.
    </div>
        
    ${
      isSuggestionsShown
        ? `
    <h2>
      Maybe you are looking for one of these paths?
    </h2>`
        : ''
    }
    ${getRestUrlSuggestionsFragment(restUrlSuggestions)}
    ${getGraphqlUrlSuggestionsFragment(graphqlUrlSuggestions)}
    `;
};
