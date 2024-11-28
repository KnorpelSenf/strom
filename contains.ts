export function makeContains<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (element: E): Promise<boolean> => {
    for await (const e of source) {
      if (e.done) break;
      if (e.value === element) return true;
    }
    return false;
  };
}
