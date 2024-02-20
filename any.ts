export function makeAny<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (): Promise<boolean> => {
    for await (const element of source) if (element) return true;
    return false;
  };
}
