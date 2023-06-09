import { type StromSource, toIterable } from "./source.ts";

export function makeFlatMap<E>(source: AsyncIterable<E>) {
  return <T>(
    transform: (element: E, index: number) => StromSource<T>,
  ): AsyncIterable<T> => {
    async function* flatMap() {
      let index = 0;
      for await (const element of source) {
        yield* toIterable(transform(element, index++));
      }
    }
    return flatMap();
  };
}
