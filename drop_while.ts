export function makeDropWhile<E>(source: AsyncIterable<E>) {
  return (
    predicate: (e: E) => boolean | Promise<boolean> = (e) => e != null,
  ): AsyncIterable<E> => {
    async function* dropWhile() {
      const itr = source[Symbol.asyncIterator]();
      let result: IteratorResult<E>;
      while (
        !(result = await itr.next()).done && !await predicate(result.value)
      );
      while (!(result = await itr.next()).done) yield result.value;
    }
    return dropWhile();
  };
}
