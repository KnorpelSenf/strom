export function makeEvery<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (
    predicate: (element: E, index: number) => boolean | Promise<boolean> = (
      e,
    ) => e != null,
  ): Promise<boolean> => {
    let index = 0;
    for await (const element of source) {
      if (!await predicate(element, index++)) {
        return false;
      }
    }
    return true;
  };
}
