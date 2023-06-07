export function makeUnique<E>(source: AsyncIterable<E>) {
  return (): AsyncIterable<E> => {
    async function* unique() {
      const set = new Set<E>();
      for await (const element of source) {
        if (!set.has(element)) {
          set.add(element);
          yield element;
        }
      }
    }
    return unique();
  };
}
