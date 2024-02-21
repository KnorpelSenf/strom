export function makeDrop<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (count: number): Iterable<Promise<IteratorResult<E>>> => {
    function* drop() {
      const itr = source[Symbol.iterator]();
      for (let i = 0; i < count; i++) itr.next();
      yield* { [Symbol.iterator]: () => itr };
    }
    return drop();
  };
}
