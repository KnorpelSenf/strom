/**
 * Source for a strom. Can be any iterator.
 */
export type StromSource<E> =
  | Iterable<E>
  | AsyncIterable<E>
  | Iterator<E>
  | AsyncIterator<E>
  | { stream(): StromSource<E> };

export async function* toIterable<E>(source: StromSource<E>): AsyncIterable<E> {
  if (Symbol.iterator in source || Symbol.asyncIterator in source) {
    yield* source;
  } else if ("stream" in source) {
    yield* toIterable(source.stream());
  } else {
    let result: IteratorResult<E>;
    while (!(result = await source.next()).done) yield result.value;
  }
}
