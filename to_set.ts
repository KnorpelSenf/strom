export function makeToSet<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (set: Set<E> = new Set()): Promise<Set<E>> => {
    for await (const element of source) {
      set.add(element);
    }
    return set;
  };
}
