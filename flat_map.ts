import { type StromSource, toIterable } from "./source.ts";

export function makeFlatMap<E>(source: AsyncIterable<E>) {
  return <T>(transform: (element: E) => StromSource<T>): AsyncIterable<T> => {
    async function* flatMap() {
      for await (const element of source) {
        yield* toIterable(transform(element));
      }
    }
    return flatMap();
  };
}
