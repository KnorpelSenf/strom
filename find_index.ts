export function makeFindIndex<E>(source: AsyncIterable<E>) {
  return async (
    predicate: (element: E, index: number) => boolean | Promise<boolean> = (
      e,
    ) => e != null,
  ): Promise<number | undefined> => {
    let index = 0;
    for await (const element of source) {
      if (await predicate(element, index)) {
        return index;
      }
      index++;
    }
    return undefined;
  };
}
