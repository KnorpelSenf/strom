export function makeBatch<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (count: number): AsyncIterable<E[]> => {
    async function* collect() {
      const itr = source[Symbol.asyncIterator]();
      let result: IteratorResult<E> = await itr.next();
      while (!result.done) {
        const tuple = Array(count);
        for (
          let i = 0;
          i < count && !result.done;
          i++, result = await itr.next()
        ) {
          tuple[i] = result.value;
        }
        yield tuple;
      }
    }
    return collect();
  };
}
