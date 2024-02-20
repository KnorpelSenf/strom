export function makeTail<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (): Iterable<Promise<IteratorResult<E>>> => {
    function* tail() {
      const itr = source[Symbol.iterator]();
      itr.next();
      yield* { [Symbol.iterator]: () => itr };
    }
    return tail();
  };
}
