export function makeMap<E>(source: AsyncIterable<E>) {
  return <T>(
    transform: (element: E, index: number) => T | Promise<T>,
  ): AsyncIterable<T> => {
    async function* map() {
      let index = 0;
      for await (const element of source) {
        yield await transform(element, index++);
      }
    }
    return map();
  };
}
