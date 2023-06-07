export function makeReduce<E>(source: AsyncIterable<E>) {
  return async <T>(
    combine: (acc: T, element: E, index: number) => T | Promise<T>,
    acc?: T,
  ): Promise<T> => {
    const itr = source[Symbol.asyncIterator]();
    let index = 0;
    let result: IteratorResult<E>;
    if (acc === undefined) {
      result = await itr.next();
      if (result.done) {
        throw new Error("Reduce of empty strom with no initial value");
      }
      index = 1;
      acc = result.value as unknown as T;
    }
    while (!(result = await itr.next()).done) {
      acc = await combine(acc, result.value, index++);
    }
    return acc;
  };
}
