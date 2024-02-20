export function makeCount<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (): Promise<number> => {
    let count = 0;
    for await (const elem of source) {
      if (elem.done) break;
      else count++;
    }
    return count;
  };
}
