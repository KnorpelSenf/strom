import { type StromSource, toIterable } from "./source.ts";

export function makeAppend<E>(source: AsyncIterable<E>) {
  return (...others: StromSource<E>[]): AsyncIterable<E> => {
    async function* append() {
      yield* source;
      for (const other of others) yield* toIterable(other);
    }
    return append();
  };
}
