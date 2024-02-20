export function makeHead<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (): Promise<E | undefined> => {
    const itr = source[Symbol.iterator]();
    const element = itr.next();
    if (element.done) return undefined;
    const value = await element.value;
    if (value.done) return undefined;
    return value.value;
  };
}
