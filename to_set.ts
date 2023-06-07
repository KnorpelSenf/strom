export function makeToSet<E>(source: AsyncIterable<E>) {
  return async (set: Set<E> = new Set()): Promise<Set<E>> => {
    for await (const element of source) {
      set.add(element);
    }
    return set;
  };
}
