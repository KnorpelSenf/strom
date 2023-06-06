export function makeMap<E>(source: AsyncIterable<E>) {
  return <T>(
    transform: (element: E, index: number) => T | Promise<T>,
  ): AsyncIterable<T> => {
    async function* map() {
      let i = 0;
      for await (const element of source) {
        yield await transform(element, i++);
      }
    }
    return map();
  };
}
