import type { ParsedUrlQuery } from 'node:querystring';

export const searchInNestedObjects = (obj: any, searchText: string) => {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (searchInNestedObjects(obj[key], searchText)) {
        return true;
      }
    } else if (typeof obj[key] === 'string' && obj[key].includes(searchText)) {
      return true;
    } else if (typeof obj[key] === 'number' && obj[key].toString().includes(searchText)) {
      return true;
    }
  }
  return false;
};

export const search = (array: any[], searchText: ParsedUrlQuery) =>
  array.filter((element) => {
    if (typeof searchText === 'string') {
      return searchInNestedObjects(element, searchText);
    }

    if (Array.isArray(searchText)) {
      return searchText.some((text) => searchInNestedObjects(element, text));
    }

    throw new Error('search technical error');
  });
