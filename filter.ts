export function makeFilter<E>(source: AsyncIterable<E>) {
  return (
    predicate: (element: E) => boolean | Promise<boolean> = (e) => e != null,
  ): AsyncIterable<E> => {
    async function* filter() {
      for await (const element of source) {
        if (await predicate(element)) {
          yield element;
        }
      }
    }
    return filter();
  };
}
