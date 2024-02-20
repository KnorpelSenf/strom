export function makeInit<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (): Iterable<Promise<IteratorResult<E>>> => {
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
