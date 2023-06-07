export function makeDropWhile<E>(source: AsyncIterable<E>) {
  return (
    predicate: (element: E, index: number) => boolean | Promise<boolean> = (
      e,
    ) => e != null,
  ): AsyncIterable<E> => {
    async function* dropWhile() {
      const itr = source[Symbol.asyncIterator]();
      let result: IteratorResult<E>;
      let index = 0;
      while (
        !(result = await itr.next()).done &&
        !await predicate(result.value, index++)
      );
      while (!(result = await itr.next()).done) yield result.value;
    }
    return dropWhile();
  };
}
