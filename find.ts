export function makeFind<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (
    predicate: (element: E, index: number) => boolean | Promise<boolean> = (
      e,
    ) => e != null,
  ): Promise<E | undefined> => {
    let index = 0;
    for await (const element of source) {
      if (element.done) break;
      if (await predicate(element.value, index++)) {
        return element.value;
      }
    }
    return undefined;
  };
}
