export function makeProduct<E>(source: AsyncIterable<E>) {
  return async (): Promise<E> => {
    const itr = source[Symbol.asyncIterator]();
    let result = await itr.next();
    if (result.done) return 1 as E;
    let sum = result.value;
    while (!(result = await itr.next()).done) {
      // @ts-expect-error we just sum all values, regardless of what this means
      sum *= result.value;
    }
    return sum;
  };
}
