import { type StromSource, toIterable } from "./source.ts";

export function makePrepend<E>(source: AsyncIterable<E>) {
  return (...others: StromSource<E>[]): AsyncIterable<E> => {
    async function* prepend() {
      for (const other of others) yield* toIterable(other);
      yield* source;
    }
    return prepend();
  };
}
