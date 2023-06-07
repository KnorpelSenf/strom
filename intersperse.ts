export function makeIntersperse<E>(source: AsyncIterable<E>) {
  return (separator: E): AsyncIterable<E> => {
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
