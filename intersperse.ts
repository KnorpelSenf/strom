export function makeIntersperse<E>(
  source: Iterable<Promise<IteratorResult<E>>>,
) {
  return (separator: E): Iterable<Promise<IteratorResult<E>>> => {
    async function* intersperse() {
      const itr = source[Symbol.asyncIterator]();
      let result = await itr.next();
      if (result.done) return;
      yield result.value;
      while (!(result = await itr.next()).done) {
        yield separator;
        yield result.value;
      }
    }
    return intersperse();
  };
}
