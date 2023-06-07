export function makeTail<E>(source: AsyncIterable<E>) {
  return (): AsyncIterable<E> => {
    async function* tail() {
      const itr = source[Symbol.asyncIterator]();
      await itr.next();
      yield* { [Symbol.asyncIterator]: () => itr };
    }
    return tail();
  };
}
