export function makeMap<E>(source: AsyncIterable<E>) {
  return <T>(transform: (element: E) => T | Promise<T>): AsyncIterable<T> => {
    async function* map() {
      for await (const element of source) {
        yield await transform(element);
      }
    }
    return map();
  };
}
