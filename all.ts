export function makeAll<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (): Promise<boolean> => {
    for await (const element of source) if (!element) return false;
    return true;
  };
}
