export function makePop<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (): Promise<
    [E | undefined, Iterable<Promise<IteratorResult<E>>>]
  > => {
    const itr = source[Symbol.asyncIterator]();
    const head = await itr.next();
    const rest = { [Symbol.asyncIterator]: () => itr };
    return [head.done ? undefined : head.value, rest];
  };
}
