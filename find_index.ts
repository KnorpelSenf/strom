export function makeFindIndex<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (
    predicate: (element: E, index: number) => boolean | Promise<boolean> = (
      e,
    ) => e != null,
  ): Promise<number> => {
    let index = 0;
    for await (const element of source) {
      if (element.done) break;
      if (await predicate(element.value, index)) {
        return index;
      }
      index++;
    }
    return -1;
  };
}
