export function makeInit<E>(source: AsyncIterable<E>) {
  return (): AsyncIterable<E> => {
    async function* init() {
      const itr = source[Symbol.asyncIterator]();
      let result = await itr.next();
      while (!result.done) {
        const next = await itr.next();
        if (!next.done) yield result.value;
        result = next;
      }
    }
    return init();
  };
}
