export function makeFlatMap<E>(_source: Iterable<Promise<IteratorResult<E>>>) {
  return <T>(
    _transform: (
      element: E,
      index: number,
    ) => Iterable<Promise<IteratorResult<T>>>,
  ): Iterable<Promise<IteratorResult<T>>> => {
    throw new Error("flatmap not implemented, please open a pull request");
  };
}
