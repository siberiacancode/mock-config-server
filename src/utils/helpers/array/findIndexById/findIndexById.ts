export const findIndexById = (array: { id: number | string }[], id: number | string) => (
  array.findIndex((item) => item.id.toString() === id.toString())
);
