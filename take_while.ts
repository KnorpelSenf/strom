export function makeTakeWhile<E>(source: AsyncIterable<E>) {
  return (
    predicate: (e: E) => boolean | Promise<boolean> = (e) => e != null,
  ): AsyncIterable<E> => {
    async function* takeWhile() {
      for await (const element of source) {
        if (!await predicate(element)) break;
        yield element;
      }
    }
    return takeWhile();
  };
}
