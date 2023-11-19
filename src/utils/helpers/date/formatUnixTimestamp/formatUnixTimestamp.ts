export const formatUnixTimestamp = (unixTimestamp: number) => {
  const date = new Date(unixTimestamp);

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  const second = `${date.getSeconds()}`.padStart(2, '0');
  const millisecond = `${date.getMilliseconds()}`.padStart(3, '0');

  return `${hour}:${minute}:${second}.${millisecond} ${day}.${month}.${year}`;
};
