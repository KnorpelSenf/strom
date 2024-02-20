import { type StromSource, toIterable } from "./source.ts";

export function makeAppend<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (
    ...others: StromSource<E>[]
  ): Iterable<Promise<IteratorResult<E>>> => {
    async function* append() {
      yield* source;
      for (const other of others) yield* toIterable(other);
    }
    return append();
  };
}
