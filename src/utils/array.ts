declare global {
  interface Array<T> {
    distinct(): Array<T>;
  }
}

Array.prototype.distinct = function <T>(): Array<T> {
  return this.filter(
    (value: T, index: number, array: T[]) => array.indexOf(value) === index
  );
};
