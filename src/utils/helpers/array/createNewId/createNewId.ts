export const createNewId = (array: { id: number | string }[]) => {
  let maxId = -1;
  for (let i = 0; i < array.length; i += 1) {
    if (typeof array[i].id === 'number' && array[i].id > maxId) {
      maxId = array[i].id as number;
    }
  }
  return maxId + 1;
};
