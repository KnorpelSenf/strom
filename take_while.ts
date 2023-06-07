export function makeTakeWhile<E>(source: AsyncIterable<E>) {
  return (
    predicate: (element: E, index: number) => boolean | Promise<boolean> = (
      e,
    ) => e != null,
  ): AsyncIterable<E> => {
    async function* takeWhile() {
      let index = 0;
      for await (const element of source) {
        if (!await predicate(element, index++)) break;
        yield element;
      }
    }
    return takeWhile();
  };
}
