export function makeAppend<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (
    ...others: Iterable<Promise<IteratorResult<E>>>[]
  ): Iterable<Promise<IteratorResult<E>>> => {
    function* append() {
      yield* source;
      for (const other of others) yield* other;
    }
    return append();
  };
}
