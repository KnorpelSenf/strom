export function makeDrop<E>(source: AsyncIterable<E>) {
  return (count: number): AsyncIterable<E> => {
    async function* drop() {
      const itr = source[Symbol.asyncIterator]();
      let result: IteratorResult<E>;
      while (!(result = await itr.next()).done && count-- >= 0);
      while (!(result = await itr.next()).done) yield result.value;
    }
    return drop();
  };
}
