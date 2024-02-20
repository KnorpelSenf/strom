export function makeReduce<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async <T>(
    combine: (acc: T, element: E, index: number) => T | Promise<T>,
    acc?: T,
  ): Promise<T> => {
    const itr = source[Symbol.iterator]();
    async function unwrapNext(): Promise<IteratorResult<E>> {
      const result = itr.next();
      if (result.done) return result;
      const res = await result.value;
      if (res.done) return res;
      return res;
    }

    let index = 0;
    // use first element if no inital value was given
    if (acc === undefined) {
      const result = await unwrapNext();
      if (result.done) {
        throw new Error("Reduce of empty strom with no initial value");
      }
      index = 1;
      const inital: E = result.value;
      acc = inital as unknown as T;
    }
    let result: IteratorResult<E>;
    while (!(result = await unwrapNext()).done) {
      acc = await combine(acc, result.value, index++);
    }
    return acc;
  };
}
