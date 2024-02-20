export function makeCount<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (): Promise<number> => {
    let count = 0;
    for await (const _ of source) count++;
    return count;
  };
}
