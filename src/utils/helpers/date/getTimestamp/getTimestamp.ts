export const getTimestamp = (unixTimestamp?: number) =>
  new Date(unixTimestamp ?? Date.now()).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    fractionalSecondDigits: 3
  });
