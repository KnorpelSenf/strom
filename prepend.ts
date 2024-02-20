import { type StromSource, toIterable } from "./source.ts";

export function makePrepend<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (
    ...others: StromSource<E>[]
  ): Iterable<Promise<IteratorResult<E>>> => {
    async function* prepend() {
      for (const other of others) yield* toIterable(other);
      yield* source;
    }
    return prepend();
  };
}
